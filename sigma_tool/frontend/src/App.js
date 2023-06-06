import { useState, useEffect, useCallback } from 'react'
import axios from 'axios';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import Table from '@splunk/react-ui/Table';
import TabBar from '@splunk/react-ui/TabBar';
import Chip from '@splunk/react-ui/Chip';
import Clipboard from '@splunk/react-icons/Clipboard';
import Paginator from '@splunk/react-ui/Paginator';
import Search from '@splunk/react-ui/Search';
import { stringify } from 'json-to-pretty-yaml';
import { HashLoader } from 'react-spinners';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Text from '@splunk/react-ui/Text';
import Code from './components/Code';

const restUrl = "http://localhost:5454"

function App() {
    const [splunkURL, setSplunkURL] = useState(null);
    const [splunkValue, setSplunkValue] = useState('');
    const [initialState, setInitialState] = useState(null);
    const [dataInstalled, setDataInstalled] = useState(false);
    const [rules, setRules] = useState([]);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [activeTabId, setActiveTabId] = useState('yaml');
    const [pageNum, setPageNum] = useState(1);
    const [pageItemCount, setPageItemCount] = useState(15);
    const [pageCount, setPageCount] = useState(1);
    const [value, setValue] = useState('');
    const [fetchButton, setFetchButton] = useState(true);



    const saveSplunkUrl = () => {
        try {
            const url = new URL(splunkValue);
            axios.post(restUrl + "/addSplunkUrl", {url: url.origin})
            .then(i => {
                let saved_text = document.querySelector("#splunk-url-saved")
                saved_text.style.display = "inline";
                setTimeout(() => {
                saved_text.style.display = "none";
                }, 1000)
    
                getSplunkUrl();
        })
        } catch (error) {
            alert("invalid URL")
        }
    }

    const getSplunkUrl = () => {
        axios.get(restUrl + '/getSplunkUrl')
        .then(i => {
            setSplunkValue(i.data.url)
            setSplunkURL(i.data.url)
        })
        .catch(i => console.error(i))
    }


    const handleChangeSearch = (e, { value: searchValue }) => {
        setValue(searchValue);
    };


    const handleChangePage = (event, { page }) => {
      if (page !== pageNum){
        setPageNum(page);
      }
    };

    useEffect(() => {
      if (initialState !== null){
        getRuleList();
      }
    }, [pageNum, value])


    const handleChange = useCallback((e, { selectedTabId }) => {
        setActiveTabId(selectedTabId);
    }, []);


    const handleRowExpansion = (rowId) => {
        setActiveTabId('yaml');
        if (expandedRowId === rowId) {
            setExpandedRowId(null);
        } else {
            setExpandedRowId(rowId);
        }
    };

    const getRuleList = async () => {
        axios.get(restUrl + "/getRuleList",{
          params: {
            start: (pageNum - 1) * pageItemCount,
            end: pageNum * pageItemCount,
            search: value.length >= 2 ? value : ""
          }
        })
        .then(i => {
            setRules(i.data.rules.map(i => JSON.parse(i)))
            setPageCount(Math.round(i.data.totalCount / pageItemCount))
            setDataInstalled(true)
            
        })
    }

    // const fetchFromGithub = async () => {
    //   setFetchButton(false);
    //   await axios.get(restUrl + "/downloadSigmaRepo")
    //   .then(() => {
    //     getRuleList();
    //     setFetchButton(true);
    //   })
    // }

    const buildSavedSearch = (rule) => {
        return (
            `[${rule.title}]
disabled = 1
description = ${rule.description}
search = ${rule.spl}
is_scheduled = 1
is_visible = 1
dispatch.earliest_time = -60m@m
dispatch.latest_time = now
cron_schedule = 0 * * * *`
        )
    }

    const goToSplunk = (spl) => {
        let URL = `${splunkURL}/en-US/app/search/search?q=search ${spl}`
        window.open(URL, '_blank')
    }

    function getExpansionRow(rule) {
        return (
            <Table.Row key={`${rule.id}-expansion`}>
                <Table.Cell style={{ borderTop: 'none' }} colSpan={6}>
                    <TabBar activeTabId={activeTabId} onChange={handleChange}>
                        <TabBar.Tab label="YAML View" tabId="yaml" />
                        <TabBar.Tab label="JSON View" tabId="json" />
                        <TabBar.Tab label="Splunk Savedsearch View" tabId="savedsearch" />
                        <TabBar.Tab label="Splunk SPL View" tabId="query" />
                    </TabBar>
                    <br />
                    {
                        activeTabId === "json" ?
                            <>
                                <CopyButton
                                    dest="yaml"
                                    text={JSON.stringify(rule, null, 4)}
                                />
                                <Code
                                    language="json"
                                    code={JSON.stringify(rule, null, 4)}
                                />
                            </>
                        : activeTabId === "yaml" ?
                            <>
                                <CopyButton
                                    dest="yaml"
                                    text={stringify(rule)}
                                />
                                <Code
                                    language="yaml"
                                    code={stringify(rule)}
                                />
                            </>
                        : activeTabId === "savedsearch" ?
                            <>
                                <CopyButton
                                    dest="savedsearch"
                                    text={buildSavedSearch(rule)}
                                />
                                <Code
                                    language="ini"
                                    code={buildSavedSearch(rule)}
                                />
                            </>
                        :
                            // SPL View
                            <> 
                               <Button
                                   label="Search on Splunk"
                                   onClick={() => goToSplunk(rule.spl)}
                                   style={{marginRight: 5}}
                                   disabled={ splunkURL === null }
                               />
 
                                <CopyButton
                                    dest="spl"
                                    text={rule.spl}
                                />
                                <Code
                                    language="splunk-spl"
                                    code={rule.spl}
                                />
                            </>
                    }
    
                </Table.Cell>
            </Table.Row>
        );
    }


    const CopyButton = ({dest, text}) => {

        const copyElementToClipboard = () => {
            navigator.clipboard.writeText(text)
            let el = document.querySelector(`#${dest}-copied`)
            el.style.display = "inline"
            setTimeout(() => {el.style.display = "none"}, 1500)
        }
        return (
            <div style={{marginBottom: 10, display: "inline"}}>
                <Button
                    label="Copy"
                    icon={<Clipboard />}
                    onClick={() => copyElementToClipboard()}
                />
                <span id={`${dest}-copied`} style={{color: '#6f6f6f', fontSize: 12, WebkitUserSelect: "none", msUserSelect: "none", userSelect: "none", marginLeft: 10}} hidden>
                    copied to clipboard...
                </span>
            </div>
        )
    }

    useEffect(() => {
        getRuleList();
        getSplunkUrl();
        setInitialState(true);
    }, [])


    useEffect(() => {
        setPageNum(1);
    }, [value])



    return (
        <>
            {
                dataInstalled === false ? 
                <div style={{
                    height: 100,
                    width: 300,
                    position: "absolute",
                    top:0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    margin: "auto",
                    textAlign: "center"

                }}>
                        <HashLoader
                            color='#FFB84C'
                            style={{
                                textAlign: "center",
                            }}
                        />
                        <br /><br /><br /><br />
                        <p>Loading</p>
                        <small>It may takes a couple of seconds according to your connection speed.</small>
                </div>
                :
                <ColumnLayout>
                  <ColumnLayout.Row style={{marginBottom: 0, marginTop: 5}}>
                      <ColumnLayout.Column span={8}>
                          <Search
                              inline
                              onChange={handleChangeSearch}
                              value={value}
                              style={{marginLeft: 5, width: 250}}
                          />
                          {/* {
                            fetchButton ?
                            <Button onClick={() => fetchFromGithub()}  label="Refresh Data from GitHub"/>
                            :
                            <Button onClick={() => fetchFromGithub()} disabled icon={<WaitSpinner/>} label="Refresh Data from GitHub"/>
                          } */}
                            <Text
                                onKeyDown={(e) => e.key === "Enter" && (splunkValue && splunkValue.trim().length > 0 && splunkURL !== splunkValue) && saveSplunkUrl()}
                                inline
                                canClear
                                placeholder='https://yoursplunkaddress'
                                value={splunkValue}
                                onChange={(e, { value: v }) => setSplunkValue(v)}
                            />
                            <Button
                                label="Save"
                                disabled={splunkValue && splunkValue.trim().length > 0 && splunkURL !== splunkValue ? false : true}
                                onClick={() => saveSplunkUrl()}
                            />
                          {' '}
                          <span id="splunk-url-saved" style={{color: '#6f6f6f', fontSize: 12, WebkitUserSelect: "none", msUserSelect: "none", userSelect: "none", marginLeft: 10}} hidden>
                                saved...
                            </span>
                      </ColumnLayout.Column>
                      <ColumnLayout.Column span={4}>
                          <Paginator
                              style={{float: 'right'}}
                              onChange={handleChangePage}
                              current={pageNum}
                              alwaysShowLastPageLink
                              totalPages={pageCount}
                          />
                      </ColumnLayout.Column>
                  </ColumnLayout.Row>
                  <ColumnLayout.Row style={{marginTop: 5}}>
                      {
                          rules.length > 0 ?
                          <Table
                              stripeRows
                              rowExpansion="controlled"
                          >
                              <Table.Head>
                                  <Table.HeadCell width={350}>Title</Table.HeadCell>
                                  <Table.HeadCell width={1000}>Description</Table.HeadCell>
                                  <Table.HeadCell width={120}>Severity</Table.HeadCell>
                                  <Table.HeadCell width={500}>Tags</Table.HeadCell>
                                  <Table.HeadCell width={20}>Status</Table.HeadCell>
                                  <Table.HeadCell>Author</Table.HeadCell>
                              </Table.Head>
                              <Table.Body>
                              {rules
                              .map((rule) => (
                                  <Table.Row 
                                      key={rule.id}
                                      expansionRow={getExpansionRow(rule, activeTabId, handleChange)}
                                      onExpansion={() => handleRowExpansion(rule.id)}
                                      expanded={rule.id === expandedRowId}
                                  >
                                      <Table.Cell>{rule.title}</Table.Cell>
                                      <Table.Cell>{rule.description}</Table.Cell>
                                      <Table.Cell>
                                        {
                                            rule.level.toLowerCase() === "critical" ?
                                            <Chip backgroundColor='#a60000' foregroundColor='white'>{rule.level}</Chip> :
                                            rule.level.toLowerCase() === "high" ?
                                            <Chip backgroundColor='#ff7676' foregroundColor='black'>{rule.level}</Chip> :
                                            rule.level.toLowerCase() === "medium" ?
                                            <Chip backgroundColor='#ffa476' foregroundColor='black'>{rule.level}</Chip> :
                                            rule.level.toLowerCase() === "low" ?
                                            <Chip backgroundColor='#ffe7ac' foregroundColor='black'>{rule.level}</Chip> :
                                            rule.level.toLowerCase() === "informational" ?
                                            <Chip backgroundColor='#80e2cb' foregroundColor='black'>{rule.level}</Chip> : null


                                        }
                                      </Table.Cell>
                                      <Table.Cell>
                                          {
                                              rule.tags ?
                                              rule.tags.map((i, index) => <Chip backgroundColor='#4f7cac' foregroundColor='#fff' key={index}>{i}</Chip>) :
                                              null
                                          }
                                      </Table.Cell>
                                      <Table.Cell>{rule.status}</Table.Cell>
                                      <Table.Cell>
                                        {
                                            rule.author.split(",").map(i => i.trim()).map((i, index) => (
                                                <Chip
                                                    style={{maxWidth: 150}}
                                                    key={index}
                                                >{i}</Chip>
                                            ))
                                        }
                                      </Table.Cell>
                                  </Table.Row>
                              ))}
                              </Table.Body>
                          </Table>
                      :
                      <p style={{marginLeft: 10}}>No result</p>
                      }

                  </ColumnLayout.Row>
                </ColumnLayout>
            }
            
        </>
    )
}

export default App;
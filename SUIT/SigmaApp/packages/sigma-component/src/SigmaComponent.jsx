import React, { useState, useEffect } from 'react'
import * as config from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import { handleError, handleResponse, defaultFetchInit } from '@splunk/splunk-utils/fetch';
import Table from '@splunk/react-ui/Table';
import Chip from '@splunk/react-ui/Chip'


async function getSigmaRules() {
  // Create URL for collection data retrieval
  const collectionUrl = createRESTURL(`sigma/getRuleList`);

  // Read in the collection of interest
  const fetchInit = defaultFetchInit;
  fetchInit.method = 'GET';
  const response = await fetch(collectionUrl, {
    ...fetchInit,
    headers: {
      'X-Splunk-Form-Key': config.CSRFToken,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    },
  })
    .then(handleResponse(200))
    .catch(handleError('error'))
    .catch((err) => (err instanceof Object ? 'error' : err));

  return response;
}


function SigmaComponent() {

    const [rules, setRules] = useState([]);

    const getRules = () => {
        getSigmaRules()
        .then(i => {
            setRules(i.result.rules)
        })
    }

    useEffect(() => {
        getRules();
    }, [])

    return (
        <Table stripeRows>
            <Table.Head>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Description</Table.HeadCell>
                <Table.HeadCell>Level</Table.HeadCell>
                <Table.HeadCell>Tags</Table.HeadCell>
                <Table.HeadCell>Author</Table.HeadCell>
                <Table.HeadCell>SPL</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {
                    rules.map(i => (
                        <Table.Row key={i.id}>
                            <Table.Cell>{ i.title }</Table.Cell>
                            <Table.Cell>{ i.description }</Table.Cell>
                            <Table.Cell>{ i.level }</Table.Cell>
                            <Table.Cell>{ i.tags?.map(x => <Chip backgroundColor='#4f7cac' foregroundColor='white'>{x}</Chip>) }</Table.Cell>
                            <Table.Cell>{ i.author?.split(",")?.map(x => <Chip>{x}</Chip>) }</Table.Cell>
                            <Table.Cell>{ i.rule }</Table.Cell>
                        </Table.Row>
                    ))
                }
            </Table.Body>
        </Table>
    )
}

export default  SigmaComponent;
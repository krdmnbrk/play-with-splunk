import React from 'react'
import Table from '@splunk/react-ui/Table'

const datas = [
    {
        id: 1,
        name: "React.js",
        by: "Facebook",
        date: "2013"
    },
    {
        id: 2,
        name: "Angular.js",
        by: "Google",
        date: "2010"
    },
    {
        id: 3,
        name: "Vue.js",
        by: "Evan You",
        date: "2014"
    },
    {
        id: 4,
        name: "Ruby on Rails",
        by: "David Heinemeier Hansson",
        date: "2005"
    },
    {
        id: 5,
        name: "Django",
        by: "Adrian Holovaty and Simon Willison",
        date: "2005"
    },
]

function SampleAppComponent() {
  return (
    <div style={{width: "30%"}}>
        <Table stripeRows>
            <Table.Head>
                <Table.HeadCell>Name</Table.HeadCell>
                <Table.HeadCell>Created By</Table.HeadCell>
                <Table.HeadCell>Created Date</Table.HeadCell>
            </Table.Head>
            <Table.Body>
                {
                    datas.map(i => (
                        <Table.Row key={i.id}>
                            <Table.Cell>{i.name}</Table.Cell>
                            <Table.Cell>{i.by}</Table.Cell>
                            <Table.Cell>{i.date}</Table.Cell>
                        </Table.Row>
                    ))
                }
                
            </Table.Body>
        </Table>
    </div>
  )
}


export default SampleAppComponent;
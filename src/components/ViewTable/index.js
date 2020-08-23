import React, {useEffect, useState} from 'react';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';

const StyledTableCell = withStyles((theme) => ({
        head: {
                color: theme.palette.common.black,
        },
        body: {
                fontSize: 14,
        },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
        root: {
                '&:nth-of-type(odd)': {
                        backgroundColor: theme.palette.action.hover,
                },
        },
}))(TableRow);


const useStyles = makeStyles({
        table: {
                minWidth: 700,
        },
        cell: {
                fontWeight: 'bold',
        },
        green: {
                color: '#20c641'
        },
        red: {
                color: '#f00007'
        },
});

const tableHead = [
        {title: '#', id: 1, numeric: false, key: "NumCode"},
        {title: 'Code', id: 2, numeric: false, key: "CharCode"},
        {title: 'Name', id: 3, numeric: false, key: "Name"},
        {title: 'Value', id: 4, numeric: true, key: "Value"},
        {title: 'Percent', id: 5, numeric: true, key: "Percent"},
        ];

function ViewTable() {
        const updateInterval = 10000;
        const classes = useStyles();
        const [data, setData] = useState({});
        const [order, setOrder] = React.useState('asc');
        const [orderBy, setOrderBy] = React.useState('NumCode');

        const sortHandler = (key) => (event) => {
                const isAsc = orderBy === key && order === 'asc';
                setOrder(isAsc ? 'desc' : 'asc');
                setOrderBy(key);
        };

        const tableSort = (object) => {
                const newArray = Object.keys(object).map((item) => object[item]);
                return newArray.sort((a, b) => {
                        const comparator = a[orderBy] <= b[orderBy] ? 1 : -1;
                        return (order === 'asc') ? comparator : -comparator;
                });
        };
        const getData = () => {
                fetch('https://www.cbr-xml-daily.ru/daily_json.js')
                        .then(result => result.json())
                        .then(result => {
                                setData(Object.keys(result.Valute).map((key) => {
                                        const {Value, Previous} = result.Valute[key],
                                                Percent = (Value / Previous * 100 -100).toFixed(2);
                                        return Object.assign({Percent}, result.Valute[key]);
                                }));
                                setTimeout(() => getData(), updateInterval);
                        })
                        .catch(err => {
                                console.log(err);
                                setTimeout(() => getData(), updateInterval);
                        });
        };

        useEffect(() => {
                getData()
        },[]);

        return (
                <Container maxWidth="md">
                        <h1>Валютные катировки</h1>
                        <TableContainer component={Paper}>
                                <Table className={classes.table} aria-label="customized table">
                                        <TableHead>
                                                <TableRow>
                                                        {tableHead.map((headCell) => (
                                                                <StyledTableCell
                                                                        key={headCell.id}
                                                                        align={headCell.numeric ? 'right' : 'left'}
                                                                        sortDirection={orderBy === headCell.key ? order : false}
                                                                >
                                                                        <TableSortLabel
                                                                                active={orderBy === headCell.key}
                                                                                direction={orderBy === headCell.key ? order : 'asc'}
                                                                                onClick={sortHandler(headCell.key)}
                                                                        >
                                                                                {headCell.title}
                                                                        </TableSortLabel>
                                                                </StyledTableCell>
                                                        ))}
                                                </TableRow>
                                        </TableHead>
                                        <TableBody>
                                                {tableSort(data).map((row) => {
                                                        const {ID, NumCode, CharCode, Name, Value, Previous, Percent} = row;
                                                        const rowClass = (Value > Previous)
                                                                ? classes.green
                                                                : (Value < Previous)
                                                                        ? classes.red
                                                                        : null;

                                                        return (
                                                                <StyledTableRow key={ID} className={rowClass}>
                                                                        <StyledTableCell>{NumCode}</StyledTableCell>
                                                                        <StyledTableCell>{CharCode}</StyledTableCell>
                                                                        <StyledTableCell>{Name}</StyledTableCell>
                                                                        <StyledTableCell align="right" className={rowClass + ' ' + classes.cell}>{Value}</StyledTableCell>
                                                                        <StyledTableCell align="right" className={rowClass + ' ' + classes.cell}>{Value > Previous ? '+' : ''}{Percent}</StyledTableCell>
                                                                </StyledTableRow>
                                                        );
                                                })}
                                        </TableBody>
                                </Table>
                        </TableContainer>
                </Container>
        );
}


export default ViewTable;
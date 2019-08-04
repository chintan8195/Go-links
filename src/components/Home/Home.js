import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Table from 'react-bootstrap/Table';
import logo from './logo.png';
import axios from 'axios';
import _ from 'lodash';
import React, { Component, Fragment } from 'react'

const WATCHERS_COUNT = 'watchers_count';
const STARGAZERS_COUNT = 'stargazers_count';
const FORKS_COUNT = 'forks_count';

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: '',
            searchResults: null,
            description: '',
            avatar:'',
            location:'',
            public_repos:'',
            org_name:'',
            sortBy: 'forks_count',
            sortOrder: 'desc',
            loading: false,
            searchError: '',
            url: '',
            show: false

        };
    }

    updateSearchValue(e) {
        this.setState({ searchValue: e.target.value });
    }

    searchGithub() {
        const { searchValue } = this.state;
        this.setState({ commitLoad: true, searchError: '' });
        axios.get(`https://api.github.com/orgs/${searchValue}/repos`)
            .then((response) => {
                // handle success
                let url = 'https://github.com/'+searchValue;
                this.setState({ searchResults: response.data, searchError: '', loading: false, url: url, show: true });
            })
            .catch((error) => {
                // handle error
                this.setState({ searchError: _.get(error, 'response.statusText', error.message), loading: false })
            });
        axios.get(`https://api.github.com/orgs/${searchValue}`)
            .then((response) => {
                // handle success
                let url = 'https://github.com/'+searchValue;
                this.setState({ org_name:response.data.name, description: response.data.description, avatar:response.data.avatar_url, location:response.data.location, public_repos:response.data.public_repos });
            })
            .catch((error) => {
                // handle error
                this.setState({public_repos:'No Records Found' })
            });
    }

    sortSearchResults() {
        const { searchResults, sortBy, sortOrder } = this.state;
        return _.orderBy(searchResults, [sortBy], [sortOrder]);
    }

    renderOrderArrow(sortName) {
        const { sortBy, sortOrder } = this.state;
        if (sortBy === sortName) {
            return sortOrder === 'desc' ? <span>&#x25be;</span> : <span>&#x25b4;</span>;
        }
    }

    renderResults() {
        const { searchResults, sortOrder, sortBy, url, org_name, description, public_repos, avatar, location, searchValue} = this.state;
        if (!_.isEmpty(searchResults)) {
            const searchResultsSorted = this.sortSearchResults();
            const oppositeSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
            return (
            <>
                <div class="row mb-5">
                    <div className="col-sm-2"><img className="text-center"src={avatar} width="50" height="50"/></div>
                    <div className="col-sm-10">
                        <div><h5>{org_name}</h5></div>
                        <div>{description}</div>
                        <div>{location}</div>
                        <div>{org_name} has {public_repos} repositories on Github.</div>
                    </div>
                </div>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Repo</th>
                            <th>
                                <a className={`order-by-anchor ${sortBy === WATCHERS_COUNT && 'selected'}`}
                                    onClick={() => this.setState({ sortBy: WATCHERS_COUNT, sortOrder: oppositeSortOrder })}>
                                    Watchers {this.renderOrderArrow(WATCHERS_COUNT)}
                                </a>
                            </th>
                            <th>
                                <a className={`order-by-anchor ${sortBy === STARGAZERS_COUNT && 'selected'}`}
                                    onClick={() => this.setState({ sortBy: STARGAZERS_COUNT, sortOrder: oppositeSortOrder })}>
                                    Stars {this.renderOrderArrow(STARGAZERS_COUNT)}
                                </a>
                            </th>
                            <th>
                                <a className={`order-by-anchor ${sortBy === FORKS_COUNT && 'selected'}`}
                                    onClick={() => this.setState({ sortBy: FORKS_COUNT, sortOrder: oppositeSortOrder })}>
                                    Forks {this.renderOrderArrow(FORKS_COUNT)}
                                </a>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {_.map(searchResultsSorted, (result, i) => {
                            return (
                                <tr>
                                    <td>{i + 1}</td>
                                    <td><a target="_blank" href={result.html_url}>{result.name}</a>
                                        <a target="_blank" className="commits" href={`${result.html_url}/commits`}>(commits)</a>
                                    </td>
                                    <td>{result.watchers_count}</td>
                                    <td>{result.stargazers_count}</td>
                                    <td>{result.forks_count}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
                
                <span className="text-center">If you want to see more repositories than the ones listed, click  
                    <a target="_blank" href={url}> (this link) </a>
                    to view {searchValue}'s organizations repository
                </span>
            </>
            )
        }
        return null;
    }

    render() {
        const { searchValue, searchError, loading, show } = this.state;

        return (
            <Fragment>
                { show ? '' : <Jumbotron fluid> 
                    <Container>
                        <h1 className="title"><img src={logo} className="App-logo" alt="logo" />search</h1>
                        <div className="text-center"> <h4>Search for repositories from any GitHub organization ranked by metric of your choice.</h4></div>
                    </Container>
                </Jumbotron>
                }
                <Container className="main">
                    <Row className="justify-content-md-center">
                        <Col xs lg="9">
                            <InputGroup className="mb-3">
                                <FormControl
                                    placeholder="Enter GitHub Organization Name Here"
                                    value={searchValue}
                                    onChange={(e) => this.updateSearchValue(e)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            this.searchGithub();
                                        }
                                    }}
                                />
                                <InputGroup.Append>
                                    <Button variant="outline-secondary" onClick={() => this.searchGithub()}>search</Button>
                                </InputGroup.Append>
                            </InputGroup>
                        </Col>
                    </Row>
                </Container>
                <Container className="results">
                    {loading && <h2 className="loading">Loading...</h2>}
                    {searchError ? <h2 className="error">{searchError}</h2> : this.renderResults()}
                </Container>
            </Fragment>
        );
    }
}

export default Home

import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContentMenu from './components/nav/ContentMenu';
import SearchMenu from './components/nav/SearchMenu';
import Player from './components/player/Player';
import Home from './components/home/Home';
import Garage from './components/garage/Garage';
import axios from 'axios';
import './app.css';
import { timeHours } from 'd3';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.toggleDarkTheme = this.toggleDarkTheme.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.state = {
            darkTheme: true,
            player: {},
            clan: {},
            vehicles: {}
        }
    }

    componentDidMount() {

    }

    toggleDarkTheme() {
        this.setState({
            darkTheme: !this.state.darkTheme
        })
    }

    getPlayerStatisticsSnapshots(accountIds) {
        axios.get(
            `http://localhost:8081/api/stats/players?accountIds=${accountIds}`
        ).then(result => {
            this.setState({
                playerStatistics: result.data
            })
        }).error(error => {
            console.log(error)
        })
    }

    getPlayerVehicleStatisticsSnapshots(accountIds, vehicleIds) {
        axios.get(
            `http://localhost:8081/api/stats/vehicles?accountIds=${accountIds}&vehicleIds=${vehicleIds}`
        ).then(result => {
            this.setState({
                vehicleStatistics: result.data
            })
        }).error(error => {
            console.log(error)
        })
    }

    getVehicles(vehicleIds, fields) {
        axios.get(
            `http://localhost:8081/api/vehicles?vehiclesIds=${vehicleIds}&fields=${fields}`
        ).then(result => {
            this.setState({
                vehicles: result.data
            })
        }).error(error => {
            console.log(error)
        })
    }

    handleSearch(searchValue, searchType) {
        if (searchType === "player") {
            this.playerSearch(searchValue);
        } else if (searchType === "clan") {
            this.clanSearch(searchValue)
        }
    }

    playerSearch(searchValue) {
        if (searchValue !== '') {
            axios.get(
                `http://localhost:8081/api/player?nickname=${searchValue}`
            ).then(result => {
                const accountId = result.data.accountId;

                this.setState({
                    accountId: accountId
                })
            }).error(error => {
                console.log(error)
            })
        } else {
            alert('please type in a username!')
        }
    }

    render() {
        return (
            <Router>
                <div id="app" className="app">
                    <SearchMenu
                        darkTheme={this.state.darkTheme}
                        handleSearch={this.handleSearch}
                    />
                    <ContentMenu
                        darkTheme={this.state.darkTheme}
                    />
                    <Routes>
                        <Route path="/" element={<Home darkTheme={this.state.darkTheme} />} />
                        <Route path="player" element={
                            this.state.player ?
                                <Player darkTheme={this.state.darkTheme} />
                                :
                                <div></div>
                        } />
                        <Route path="garage/*" element={<Garage />} />
                        {/* <Route path="clan" element={
                            this.state.clan ?
                                <Clan darkTheme={this.state.darkTheme} />
                                :
                                <div></div>
                        } />
                        <Route path="tankopedia" element={
                            this.state.vehicles ?
                                <Tankopedia darkTheme={this.state.darkTheme} />
                                :
                                <div></div>
                        } /> */}
                    </Routes>
                </div>
            </Router>
        );
    }

}

import React, { Component } from 'react'
import './App.css'
import { updateData } from './utilities/update_sensor_data'
import Map from './components/map'
import Sidebar from './components/sidebar'
import Legend from './components/legend'
import PhenomenonPicker from './components/phenomenonPicker'
import UpdatedTime from './components/updatedTime'


class App extends Component {


  componentDidMount () {
    updateData()
    setInterval(updateData, 6e4)
  }

  render () {
    return (
      <div className="container">
        <Map />
        <UpdatedTime />
        <PhenomenonPicker />
        <Legend />
        <Sidebar />
      </div>

    )
  }
}

export default App

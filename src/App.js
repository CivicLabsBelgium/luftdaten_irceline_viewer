import React, { Component } from 'react'
import './styles/App.css'
import './styles/dataOriginPicker.css'
import './styles/updatedTime.css'
import './styles/legend.css'
import './styles/phenomenonPicker.css'
import './styles/sidebar.css'
import './styles/map.css'
import { updateLuftdaten, updateIrceline } from './utilities/update_sensor_data'
import Map from './components/map'
import Sidebar from './components/sidebar'
import Legend from './components/legend'
import PhenomenonPicker from './components/phenomenonPicker'
import UpdatedTime from './components/updatedTime'
import DataOriginPicker from './components/dataOriginPicker'


class App extends Component {


  componentDidMount () {

    // Update luftdaten every minute
    updateLuftdaten().then()
    setInterval(updateLuftdaten, 6e4)

    // Update Irceline every 10 minutes
    updateIrceline().then()
    setInterval(updateIrceline, 6e5)
  }

  render () {
    return (
      <div className="container">
        <Map />
        <div className="UI_container">
          <UpdatedTime />
          <Legend />
          <DataOriginPicker />
          <PhenomenonPicker />
        </div>
        <Sidebar />
      </div>

    )
  }
}

export default App

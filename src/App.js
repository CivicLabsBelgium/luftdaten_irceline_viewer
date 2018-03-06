import { globalConfig } from './config'
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
import * as polyfill from './utilities/polyfills'

class App extends Component {

  constructor(props) {
    super(props)
    polyfill.arrayFindPolyfill()
    polyfill.findIndexPolyfill()
  }

  componentDidMount () {
    //TODO read values from location hash and set geolocation, zoom and other states according to this hash


    // Update luftdaten every minute (pm)
    updateLuftdaten().then()
    setInterval(updateLuftdaten, 2*6e4)

    // Update Irceline every 10 minutes
	if (globalConfig.showIrceline) {
		updateIrceline().then()
		setInterval(updateIrceline, 6e5)
	}
  }

  render () {
    return (
      <div className="container">
        <Map />
        <div className="UI_container">
          <UpdatedTime />
          <Legend />
{
	(globalConfig.showIrceline) ? <React.Fragment>
		  <DataOriginPicker />
    </React.Fragment> : null
}
          <PhenomenonPicker />
        </div>
        <Sidebar />
      </div>

    )
  }
}

export default App

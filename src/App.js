import { globalConfig } from './config'
import React, { Component } from 'react'
import './styles/App.css'
import './styles/dataOriginPicker.css'
import './styles/updatedTime.css'
import './styles/legend.css'
import './styles/phenomenonPicker.css'
import './styles/sidebar.css'
import './styles/map.css'
import { updateLuftdaten, updateLuftdatenMean, updateIrceline } from './utilities/updateSensorData'
import Map from './components/map'
import Sidebar from './components/sidebar'
import Legend from './components/legend'
import PhenomenonPicker from './components/phenomenonPicker'
import UpdatedTime from './components/updatedTime'
import DataOriginPicker from './components/dataOriginPicker'
import * as polyfill from './utilities/polyfills'

class App extends Component {

  constructor (props) {
    super(props)
    polyfill.arrayFindPolyfill()
    polyfill.findIndexPolyfill()
  }

  componentDidMount () {
    //TODO read values from location hash and set geolocation, zoom and other states according to this hash

    // Update luftdaten every minute (pm)
    updateLuftdaten().then(updateLuftdatenMean)
    setInterval(updateLuftdaten, 2 * 6e4)

    // Update Irceline every 10 minutes
    if (globalConfig.showIrceline) {
      updateIrceline().then()
      setInterval(updateIrceline, 6e5)
    }
  }

  render () {
    return (
      <div className='container'>
        <div style={{position: 'absolute', top: 0, right: 0, zIndex: 401}}>
          <a href='https://github.com/CivicLabsBelgium/luftdaten_irceline_viewer' target='_blank' rel='noopener noreferrer'>
            <img style={{border: 0}} src='https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png' alt='Fork me on GitHub' />
          </a>
        </div>
        <Map/>
        <div className='UI_container'>
          <UpdatedTime/>
          <Legend/>
          {
            (globalConfig.showIrceline) ? <React.Fragment>
              <DataOriginPicker/>
            </React.Fragment> : null
          }
          <PhenomenonPicker/>
        </div>
        <Sidebar/>
      </div>

    )
  }
}

export default App
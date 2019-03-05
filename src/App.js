import React, { Component } from 'react'
import './styles/App.css'
import './styles/dataOriginPicker.css'
import './styles/updatedTime.css'
import './styles/legend.css'
import './styles/phenomenonPicker.css'
import './styles/sidebar.css'
import './styles/map.css'
import './styles/mobile.css'
import { updateLuftdaten, updateLuftdatenMean, updateIrceline } from './utilities/updateSensorData'
import Map from './components/map'
import Sidebar from './components/sidebar'
import Legend from './components/legend'
import PhenomenonPicker from './components/phenomenonPicker'
import UpdatedTime from './components/updatedTime'
import DataOriginPicker from './components/dataOriginPicker'
import * as polyfill from './utilities/polyfills'
import request from './request/request'
import { connect } from 'react-redux'
import { setConfig, setTilesAccessToken } from './redux/globalConfig/actions'
import { setLang } from './redux/appState/actions'

class App extends Component {

  constructor (props) {
    super(props)
    polyfill.arrayFindPolyfill()
    polyfill.findIndexPolyfill()

    const userLang = navigator.language
    try {
      const lang = require(`./lang/${userLang}.json`)
      props.onSetLang(lang)
    } catch (e) {
      console.warn(`Your current browser language "${userLang}" is not supported by this app, falling back to default (en).`)
    }

    this.state = {
      uiContainerToggled: false
    }

    try {
      const config = require('./config')
      props.onSetConfig(config.globalConfig)
      console.log('importing globalConfig from config.js')
    } catch (e) {
      console.warn('config.js was not found, using globalConfig defaults.')
      const options = {
        method: 'GET',
        url: window.origin + '/token'
      }
      request(options)
        .then(
          res => {
            console.log('Got TILES_ACCESS_TOKEN environment variable')
            if(!res.tilesAccessToken) {
              throw new Error('TILES_ACCESS_TOKEN is undefined')
            }
            props.onSetTilesAccessToken(res.tilesAccessToken)
          }
        )
        .catch(() => {
            console.warn('TILES_ACCESS_TOKEN environment variable must be set if config.js.dist was not copied as config.js')
            props.onSetTilesAccessToken(false)
          }
        )
    }
  }

  componentDidMount () {
    //TODO read values from location hash and set geolocation, zoom and other states according to this hash

    updateLuftdaten().then(updateLuftdatenMean)
    setInterval(updateLuftdatenMean, 3.6e+6) // update mean values every hour
    setInterval(updateLuftdaten, 2 * 6e4) // update sensors every 2 minutes

    // Update Irceline every 10 minutes
    if (this.props.showIrceline) {
      updateIrceline().then()
      setInterval(updateIrceline, 6e5)
    }
  }

  handleSwipe = () => {
    this.setState(
      {
        uiContainerToggled: !this.state.uiContainerToggled
      }
    )
  }

  render () {
    const {
      tilesAccessToken,
    } = this.props

    if (tilesAccessToken === false) {
      return (
        <div>Please set a TILES_ACCESS_TOKEN environment variable or edit config.js before building this app.</div>
      )
    }

    if (!tilesAccessToken) {
      return (
        <div>Loading ...</div>
      )
    }

    return (
      <div className='container'>
        <div className='github-ribbon'>
          <a href='https://github.com/CivicLabsBelgium/luftdaten_irceline_viewer' target='_blank'
             rel='noopener noreferrer'>
            <img src='https://s3.amazonaws.com/github/ribbons/forkme_right_gray_6d6d6d.png'
                 alt='Fork me on GitHub'/>
          </a>
        </div>
        <Map/>
        <UpdatedTime/>
        <div className={this.state.uiContainerToggled ? 'UI_container open' : 'UI_container collapsed'}>
          <button className='toggle-panel' style={{display: 'none'}}
                  onClick={this.handleSwipe}>{this.props.lang.close}</button>
          <Legend/>
          {
            (() => {
              const pickers = <React.Fragment>
                {
                  (this.props.showIrceline) ? <DataOriginPicker/> : null
                }
                <PhenomenonPicker/>
              </React.Fragment>
              return this.state.uiContainerToggled ? <div className='Pickers'>{pickers}</div> : pickers
            })()
          }
        </div>
        <Sidebar/>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    tilesAccessToken: state.globalConfig.tilesAccessToken,
    showIrceline: state.globalConfig.showIrceline,
    lang: state.appState.lang
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSetTilesAccessToken: tilesAccessToken => {
      dispatch(setTilesAccessToken(tilesAccessToken))
    },
    onSetConfig: config => {
      dispatch(setConfig(config))
    },
    onSetLang: lang => {
      dispatch(setLang(lang))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)

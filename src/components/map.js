import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStation } from '../redux/appState/actions'
import { createMarkerIconSVG } from '../utilities/generic_functions'
import { blend_colors } from '../utilities/colorBlender'

const showBordersForDistinctDataSource = false

class Map extends Component {

  constructor (props) {
    super(props)
    this.state = {
      map: null
    }
    this.showMarkers = this.showMarkers.bind(this)
  }

  componentDidMount () {
    let map = window.L.map('map', {
      center: [50.843, 4.368],
      zoom: 13,
      minZoom: 8,
      maxBounds: [
        [51.666742, 2.123954],
        [49.209022, 6.975232]
      ]
    })

    map.addEventListener('click', () => this.props.onChangeCurrentStation(null))

    window.L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map stations &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiZGF2aWRzaW5naCIsImEiOiJjamIxenh3eXQyNmduMnFwaWJnNzlycTczIn0.CWe6Ty3qZ-AD17PP6D7vpA'
    }).addTo(map)

    this.setState({
      map: map
    })
  }

  showMarkers () {

    console.log('updated markers')

    let stations = this.props.stations

    for (let k in stations) {

      let hexagonMarkerOptions = {
        color: '#888',
        borderColor: '#000',
        size: 50,
        content: ''
      }

      const station = stations[k]

      for(let i in station.sensors) {
        const sensor = station.sensors[i]
        const phenomenon = this.props.appState.phenomenon
        if(typeof sensor[phenomenon] !== 'undefined' && sensor[phenomenon] !== null) {
          const currentValue = sensor[phenomenon]
          const phenomenonMeta = this.props.appState.phenomenonMeta[phenomenon]
          const valueExceedsIndex = phenomenonMeta.values.indexOf(
            (phenomenonMeta.values.find(
              (value) => {
                return value >= currentValue
              }
            ) || phenomenonMeta.values[phenomenonMeta.values.length - 1]))
          const valueLower = phenomenonMeta.values[valueExceedsIndex-1]
          const valueUpper = phenomenonMeta.values[valueExceedsIndex] - valueLower
          const valuePercent = (currentValue-valueLower) / valueUpper
          const colorLower = phenomenonMeta.colors[valueExceedsIndex-1]
          const colorUpper = phenomenonMeta.colors[valueExceedsIndex]

          hexagonMarkerOptions.color = blend_colors(colorLower, colorUpper, valuePercent)

          break
        }
      }

      //luftdaten border
      if(station.origin === "luftdaten") {
        hexagonMarkerOptions.borderColor = '#44E'
      }

      //irceline border
      if(station.origin === "irceline") {
        hexagonMarkerOptions.borderColor = '#4E4'
      }

      if(showBordersForDistinctDataSource === false) {
        hexagonMarkerOptions.borderColor = hexagonMarkerOptions.color
      }

      //selected border
      if(this.props.appState.station && this.props.appState.station.id === station.id) {
        hexagonMarkerOptions.borderColor = '#000'
      }

      let markerOptions = {
        icon:
          window.L.divIcon({
            className: 'hexagonMarker',
            html: createMarkerIconSVG(hexagonMarkerOptions)
          })
      }


      const marker = window.L.marker([station.latitude, station.longitude], markerOptions)
        .addTo(this.state.map)
      marker.addEventListener('click', () => this.props.onChangeCurrentStation(station))

    }

  }

  render () {
    this.showMarkers()
    return (
      <div id="map"/>
    )
  }
}




const mapStateToProps = state => {
  return {
    appState: state.appState,
    stations: state.stations
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChangeCurrentStation: sensor => {
      dispatch(setCurrentStation(sensor))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
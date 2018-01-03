import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStation } from '../redux/appState/actions'
import { createMarkerIconSVG, colorToRgba, snapToGrid } from '../utilities/generic_functions'
import { blend_colors } from '../utilities/colorBlender'

class Map extends Component {

  markerLayers = {luftdaten: [], irceline: [], all: []}

  constructor (props) {
    super(props)
    this.state = {
      map: null,
      layerGroup: null
    }
    this.showMarkers = this.showMarkers.bind(this)
  }

  componentDidMount () {
    const map = window.L.map('map', {
      center: [50.843, 4.368],
      zoom: 12,
      minZoom: 4,
      // restrict panning and zooming to belgium
      // maxBounds: [
      //   [51.666742, 2.123954],
      //   [49.209022, 6.975232]
      // ],
      scrollWheelZoom: 'center'
    })

    map.addEventListener('click', () => this.props.onChangeCurrentStation(null))
    map.addEventListener('zoomend', () => this.render())

    window.L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map stations &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiZGF2aWRzaW5naCIsImEiOiJjamIxenh3eXQyNmduMnFwaWJnNzlycTczIn0.CWe6Ty3qZ-AD17PP6D7vpA'
    }).addTo(map)

    const layerGroup = window.L.layerGroup([]).addTo(map)

    this.setState({
      map: map,
      layerGroup: layerGroup
    })
  }

  showMarkers () {

    // TODO center view on selected hexagon when render/showmarkers is called by zoomend event
    // if (this.props.appState.station) {
    //   //center zoom on marker
    //   const latLng = [0,0]
    //   const zoom = this.state.map.getZoom()
    //   this.state.map.setView(latLng, zoom)
    // }


    this.markerLayers.luftdaten = []
    this.markerLayers.irceline = []
    this.markerLayers.all = []

    if (this.state.layerGroup)
      this.state.layerGroup.clearLayers()

    let stations = this.props.stations
    let markers = []

    for (let k in stations) {

      let hexagonMarkerOptions = {
        hexagonIsSelected: false,
        size: 50
      }

      const station = stations[k]

      let hasSensorForCurrentPhenomenon = false


      for (let i in station.sensors) {
        const sensor = station.sensors[i]
        const phenomenon = this.props.appState.phenomenon
        if (typeof sensor[phenomenon] !== 'undefined' && sensor[phenomenon] !== null) {
          hasSensorForCurrentPhenomenon = true
          const currentValue = sensor[phenomenon]
          const phenomenonMeta = this.props.appState.phenomenonMeta[phenomenon]
          const valueExceedsIndex = phenomenonMeta.values.indexOf(
            (phenomenonMeta.values.find(
              (value) => {
                return value >= currentValue
              }
            ) || phenomenonMeta.values[phenomenonMeta.values.length - 1]))
          const valueLower = phenomenonMeta.values[valueExceedsIndex - 1]
          const valueUpper = phenomenonMeta.values[valueExceedsIndex] - valueLower
          const valuePercent = (currentValue - valueLower) / valueUpper
          const colorLower = phenomenonMeta.colors[valueExceedsIndex - 1]
          const colorUpper = phenomenonMeta.colors[valueExceedsIndex]

          const colorBlend = blend_colors(colorLower, colorUpper, valuePercent)
          hexagonMarkerOptions.color = colorToRgba(colorBlend, 0.4)

          break
        }
      }

      //selected border
      if (this.props.appState.station && this.props.appState.station.id === station.id) {
        hexagonMarkerOptions.hexagonIsSelected = true
      }

      let markerOptions = {
        icon:
          window.L.divIcon({
            className: 'hexagonMarker',
            html: createMarkerIconSVG(hexagonMarkerOptions)
            // iconAnchor: [0-hexagonMarkerOptions.size/2, 0-hexagonMarkerOptions.size/2]
          }),
        stations: [station]
      }

      //add markers to layergroup
      if (hasSensorForCurrentPhenomenon) {

        const latlngSnappedToGrid = snapToGrid([station.latitude, station.longitude], this.state.map, hexagonMarkerOptions.size)
        const marker = window.L.marker(latlngSnappedToGrid, markerOptions)

        this.markerLayers[station.origin].push(marker)
        this.markerLayers['all'].push(marker)
      }
    }


    //REDUCES AND BUNDLES MARKERS
    this.markerLayers.all = this.markerLayers.all.reduce(
      (accumulator, currentMarker) => {

        if(accumulator.length == 0)
          return [currentMarker]

        const found = accumulator.findIndex(
          (bundledMarker) => bundledMarker._latlng.lat == currentMarker._latlng.lat &&
              bundledMarker._latlng.lng == currentMarker._latlng.lng
        )
        if(found != -1) {
          accumulator[found].options.stations.push(currentMarker.options.stations[0])
        } else {
          accumulator.push(currentMarker)
        }
        return accumulator
      }, []
    )


    this.markerLayers.all.forEach(
      (marker) => {
        marker.addEventListener('click',
          () => {
            this.props.onChangeCurrentStation(marker.options.stations)


            //center zoom on marker
            const latLng = marker.getLatLng()
            const zoom = this.state.map.getZoom()
            this.state.map.setView(latLng, zoom)
          }
        )
        marker.addTo(this.state.layerGroup)
      }
    )



    if (this.props.dataOrigin.luftdaten) {
      this.markerLayers.luftdaten.forEach(
        (marker) => {
          marker.addTo(this.state.layerGroup)
        }
      )
    }

    if (this.props.dataOrigin.irceline) {
      this.markerLayers.irceline.forEach(
        (marker) => {
          marker.addTo(this.state.layerGroup)
        }
      )
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
    stations: state.stations,
    dataOrigin: state.appState.dataOrigin
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
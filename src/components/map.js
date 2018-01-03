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

    const hexSize = 50

    this.markerLayers.luftdaten = []
    this.markerLayers.irceline = []
    this.markerLayers.all = []

    if (this.state.layerGroup)
      this.state.layerGroup.clearLayers()

    let stations = this.props.stations

    for (let k in stations) {

      const station = stations[k]

      let hasSensorForCurrentPhenomenon = false

      for (let i in station.sensors) {
        const sensor = station.sensors[i]
        const phenomenon = this.props.appState.phenomenon
        if (typeof sensor[phenomenon] !== 'undefined' && sensor[phenomenon] !== null) {
          hasSensorForCurrentPhenomenon = true
          break
        }
      }

      //TODO FIX THIS
      // add markers to layergroup
      if (hasSensorForCurrentPhenomenon) {

        const latlngSnappedToGrid = snapToGrid([station.latitude, station.longitude], this.state.map, hexSize)
        const bundledStations = {
          stations: [station],
          latlng: latlngSnappedToGrid
        }

        this.markerLayers['all'].push(bundledStations)
      }
    }

    //REDUCES AND BUNDLES MARKERS
    this.markerLayers.all = this.markerLayers.all.reduce(
      (accumulator, currentMarker) => {

        const found = accumulator.findIndex(
          (bundledStations) => bundledStations.latlng.lat === currentMarker.latlng.lat &&
            bundledStations.latlng.lng === currentMarker.latlng.lng
        )
        if (found !== -1) {
          accumulator[found].stations.push(currentMarker.stations[0])
        } else {
          accumulator.push(currentMarker)
        }
        return accumulator
      }, []
    )

    this.markerLayers.all.forEach(
      (marker) => {
        /// CALCULATE AVERAGE VALUE OF SELECTED PHENOMENON FOR EACH MARKER

        let sumValues = 0
        let countValues = 0

        marker.stations.forEach(
          station => {
            station.sensors.forEach(
              sensor => {

                const currentValue = sensor[this.props.appState.phenomenon]
                if (typeof currentValue !== 'undefined') {
                  countValues++
                  sumValues += parseFloat(currentValue)
                }
              }
            )
          }
        )
        const meanValue = (sumValues / countValues)

        //ASSIGN MARKER COLOR BLEND BASED ON MEAN VALUE

        const phenomenonMeta = this.props.appState.phenomenonMeta[this.props.appState.phenomenon]
        const valueExceedsIndex = phenomenonMeta.values.indexOf(
          (phenomenonMeta.values.find(
            (value) => {
              return value >= meanValue
            }
          ) || phenomenonMeta.values[phenomenonMeta.values.length - 1]))
        const valueLower = phenomenonMeta.values[valueExceedsIndex - 1]
        const valueUpper = phenomenonMeta.values[valueExceedsIndex] - valueLower
        const valuePercent = (meanValue - valueLower) / valueUpper
        const colorLower = phenomenonMeta.colors[valueExceedsIndex - 1]
        const colorUpper = phenomenonMeta.colors[valueExceedsIndex]
        const colorBlend = blend_colors(colorLower, colorUpper, valuePercent)

        let hexagonIconOptions = {
          hexagonIsSelected: false,
          size: hexSize,
          color: colorToRgba(colorBlend, 0.6)
        }

        //selected border on any marker containing selected station
        if (this.props.appState.station && marker.stations.find(
            station => {
              return this.props.appState.station.find(
                selectedStation => (selectedStation.id === station.id)
              )
            }
          )) {
          hexagonIconOptions.hexagonIsSelected = true
        }

        let markerOptions = {
          icon:
            window.L.divIcon({
              className: 'hexagonMarker',
              html: createMarkerIconSVG(hexagonIconOptions)
              // iconAnchor: [0-hexagonIconOptions.size/2, 0-hexagonIconOptions.size/2]
            }),
          stations: marker.stations
        }

        marker = window.L.marker(marker.latlng, markerOptions)

        // ADD BUNDLED MARKERS TO MAP
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
    onChangeCurrentStation: station => {
      dispatch(setCurrentStation(station))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)
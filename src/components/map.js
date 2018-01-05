import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStationList, setMapCoords } from '../redux/appState/actions'
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
      maxBounds: [
        [51.666742, 2.123954],
        [49.209022, 6.975232]
      ],
      scrollWheelZoom: 'center'
    })

    map.addEventListener('click', () => this.props.onChangeCurrentStation(null))
    map.addEventListener('zoomend', () => {
      this.showMarkers(this.props)
    })

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

  showMarkers (nextProps) {

    const hexSize = 50
    this.markerLayers.all = []

    if (this.state.layerGroup)
      this.state.layerGroup.clearLayers()

    let stations = nextProps.stations

    for (let k in stations) {

      const station = stations[k]

      if(nextProps.appState.dataOrigin[station.origin] === false)
        continue;

      let hasSensorForCurrentPhenomenon = false

      for (let i in station.sensors) {
        const sensor = station.sensors[i]
        const phenomenon = nextProps.appState.phenomenon
        if (typeof sensor[phenomenon] !== 'undefined' && sensor[phenomenon] !== null) {
          hasSensorForCurrentPhenomenon = true
          break
        }
      }


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

                const currentValue = sensor[nextProps.appState.phenomenon]
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

        const phenomenonMeta = nextProps.appState.phenomenonMeta[nextProps.appState.phenomenon]
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

        //selected border on any marker containing selected stationList
        if (nextProps.appState.stationList && marker.stations.find(
            station => {
              return nextProps.appState.stationList.find(
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
            nextProps.onChangeCurrentStation(marker.options.stations)

            //center zoom on marker
            const coords = marker.getLatLng()
            this.centerOnCoords(coords)
          }
        )
        marker.addTo(this.state.layerGroup)
      }
    )

  }

  centerOnCoords (coords, zoom = this.state.map.getZoom()) {
    this.state.map.setView(coords, zoom)
  }

  componentWillReceiveProps (nextProps) {
    if(this.props.appState.mapCoords !== nextProps.appState.mapCoords)
      this.centerOnCoords(nextProps.appState.mapCoords, 14)

    this.showMarkers(nextProps)
  }

  shouldComponentUpdate() {
    return false
  }

  render () {
    return (
      <div id="map"/>
    )
  }
}


const mapStateToProps = state => {
  return {
    appState: state.appState,
    stations: state.stations,
  }

}

const mapDispatchToProps = dispatch => {
  return {
    onChangeCurrentStation: station => {
      dispatch(setCurrentStationList(station))
    },
    onSetMapCoords: coords => {
      dispatch(setMapCoords(coords))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)

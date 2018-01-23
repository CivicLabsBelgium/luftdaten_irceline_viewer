import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentStationList, setMapCoords } from '../redux/appState/actions'
import { createMarkerIconSVG, colorToRgba, snapToGrid } from '../utilities/generic_functions'
import { setParams, getParams } from '../utilities/updateURL'
import { blend_colors } from '../utilities/colorBlender'

class Map extends Component {

  markerLayer = []
  isZooming = false

  constructor (props) {
    super(props)
    this.state = {
      map: null,
      layerGroup: null
    }
    this.showMarkers = this.showMarkers.bind(this)
  }

  componentDidMount () {
    const initialParams = getParams() || {}

    const map = window.L.map('map', {
      center: [initialParams.lat || 50.843, initialParams.lng || 4.368],
      zoom: initialParams.zoom || 12,
      minZoom: 6,
      // restrict panning and zooming to belgium
      maxBounds: [
        [60, -20],
        [40, 25]
      ],
      scrollWheelZoom: 'center'
    })

    map.addEventListener('click', () => this.props.onChangeCurrentStation(null))
    map.addEventListener('zoomstart', () => {
        this.isZooming = true
      }
    )
    map.addEventListener('zoomend', () => {
        console.log('### zoom event')
        this.showMarkers(this.props)
        let params = getParams()
        console.log('old', params)
        params.zoom = map.getZoom()
        setParams(params)
        console.log('new', params)
        console.log('###')
      }
    )
    map.addEventListener('moveend', () => {
      if (!this.isZooming) {
        console.log('### move event')
        let params = getParams()
        console.log('old', params)
        if (typeof params.id !== 'undefined')
          delete params.id
        params.lat = map.getCenter().lat
        params.lng = map.getCenter().lng
        params.zoom = map.getZoom()
        console.log('new', params)
        setParams(params)
        console.log('###')
      }
      this.isZooming = false
    })

    window.L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map stations &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 18,
      id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoiZGF2aWRzaW5naCIsImEiOiJjamIxenh3eXQyNmduMnFwaWJnNzlycTczIn0.CWe6Ty3qZ-AD17PP6D7vpA'
    }).addTo(map)

    const layerGroup = window.L.layerGroup([]).addTo(map)

    this.setState({
      map: map, //TODO refactor this.map
      layerGroup: layerGroup
    })
  }

  showMarkers (nextProps) {

    const hexSize = 50
    this.markerLayer = []

    if (this.state.layerGroup)
      this.state.layerGroup.clearLayers()

    let stations = nextProps.stations

    for (let k in stations) {

      const station = stations[k]

      //station origin deselected by user
      if (nextProps.appState.dataOrigin[station.origin] === false)
        continue

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

        this.markerLayer.push(bundledStations)
      }
    }

    //REDUCES AND BUNDLES MARKERS
    this.markerLayer = this.markerLayer.reduce(
      (accumulator, currentMarker) => {

        const found = accumulator.findIndex(
          bundledStations => bundledStations.latlng.lat === currentMarker.latlng.lat &&
            bundledStations.latlng.lng === currentMarker.latlng.lng
        )
        if (found !== -1) { // if (~found)
          accumulator[found].stations.push(currentMarker.stations[0])
        } else {
          accumulator.push(currentMarker)
        }
        return accumulator
      }, []
    )

    this.markerLayer.forEach(
      marker => {
        /// CALCULATE AVERAGE VALUE OF SELECTED PHENOMENON FOR EACH MARKER

        let sumValues = 0
        let countValues = 0

        //zoom in on the station with the same ID provided in the querystring
        const params = getParams()
        let foundParamsID = false

        //group and render all sensors from all stations
        marker.stations.forEach(
          station => {
            station.sensors.forEach(
              sensor => {

                if(!foundParamsID && params.id && params.id === sensor.stationID) {
                  foundParamsID = true
                  const params = getParams()
                  delete params.lat
                  delete params.lng

                  this.centerOnCoords({
                    lat: station.latitude,
                    lng: station.longitude
                  }, 14)

                  console.log(params)
                  console.log('looking for ' + params.id, sensor.stationID)

                }

                // //ID found
                // if(!foundParamsID && sensor.stationID === params.id) {
                //   this.centerOnCoords({
                //     lat: station.latitude,
                //     lng: station.longitude
                //   })
                //   delete params.lat
                //   delete params.lng
                //   params.id = sensor.stationID
                //   console.log(params)
                //   setParams(params)
                //   foundParamsID = true
                // }

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

        //TODO move phenomenonmeta to separate file

        const phenomenonMeta = nextProps.appState.phenomenonMeta[nextProps.appState.phenomenon]
        const valueExceedsIndex = phenomenonMeta.data.indexOf(
          (phenomenonMeta.data.find(
            (data) => {
              return data.value >= meanValue
            }
          ) || phenomenonMeta.data[phenomenonMeta.data.length - 1].value))
        const valueLower = phenomenonMeta.data[valueExceedsIndex - 1].value
        const valueUpper = phenomenonMeta.data[valueExceedsIndex].value - valueLower
        const valuePercent = (meanValue - valueLower) / valueUpper
        const colorLower = phenomenonMeta.data[valueExceedsIndex - 1].color
        const colorUpper = phenomenonMeta.data[valueExceedsIndex].color
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

    if (this.props.appState.mapCoords !== nextProps.appState.mapCoords)
      this.centerOnCoords(nextProps.appState.mapCoords, 14)

    //unselect stations that have no sensors for currently selected phenomenon OR selected data origin
    if (this.props.appState.phenomenon !== nextProps.appState.phenomenon || this.props.appState.dataOrigin !== nextProps.appState.dataOrigin) {
      let reduced_stationList = (nextProps.appState.stationList === null) ? [] : nextProps.appState.stationList.reduce(
        (accumulator, station) => {

          const hasSensor = station.sensors.find(
            (sensor) => {
              return sensor[nextProps.appState.phenomenon] && nextProps.appState.dataOrigin[sensor.origin]
            }
          ) !== undefined

          if (hasSensor)
            accumulator.push(station)

          return accumulator
        }, []
      )

      if (reduced_stationList.length === 0)
        reduced_stationList = null

      if (nextProps.appState.stationList !== reduced_stationList)
        this.props.onChangeCurrentStation(reduced_stationList)
    }

    this.showMarkers(nextProps)
  }

  shouldComponentUpdate () {
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
    stations: state.stationUpdates.stations,
  }

}

const mapDispatchToProps = dispatch => {
  return {
    onChangeCurrentStation: stationList => {
      dispatch(setCurrentStationList(stationList))
    },
    onSetMapCoords: coords => {
      dispatch(setMapCoords(coords))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)

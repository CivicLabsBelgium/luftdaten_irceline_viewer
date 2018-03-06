import { globalConfig } from '../config'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setCurrentSensor, setCurrentStationList, setID, setMapCoords } from '../redux/appState/actions'
import { createMarkerIconSVG, colorToRgba, snapToGrid } from '../utilities/generic_functions'
import { setParams, getParams } from '../utilities/updateURL'
import { blendColors } from '../utilities/colorBlender'

class Map extends Component {
  constructor (props) {
    super(props)
    this.state = {
      map: null,
      layerGroup: null
    }
    this.markerLayer = []
    this.isZooming = false
    this.isMoving = false
    this.centeredOnSensorFromURL = false
    this.showMarkers = this.showMarkers.bind(this)
  }

  componentDidMount () {
    // get shared url parameters
    const initialParams = getParams() || {}
    if (initialParams.id) {
      initialParams.zoom = 14
    }

    const map = window.L.map('map', {
      center: [initialParams.lat || globalConfig.lat, initialParams.lng || globalConfig.lng],
      zoom: initialParams.zoom || globalConfig.zoom,
      minZoom: globalConfig.minZoom,
      maxBounds: globalConfig.maxBounds,
      scrollWheelZoom: 'center'
    })

    map.addEventListener('click', () => this.props.onChangeCurrentStation(null))
    map.addEventListener('zoomstart', () => {
        this.isZooming = true
      }
    )
    map.addEventListener('zoomend', () => {
        this.showMarkers(this.props)
        let params = getParams()
        params.zoom = map.getZoom()
        setParams(params)
      }
    )
    map.addEventListener('moveend', () => {
      if (!this.isZooming && !this.isMoving) {
        let params = getParams()
        if (params.id)
          delete params.id
        params.lat = map.getCenter().lat
        params.lng = map.getCenter().lng
        params.zoom = map.getZoom()
        setParams(params)
      }
      this.isZooming = false
      this.isMoving = false
    })

    window.L.tileLayer(globalConfig.tilesURL, {
      attribution: globalConfig.tilesAttribution,
      maxZoom: globalConfig.maxZoom,
      id: globalConfig.tilesID,
      accessToken: globalConfig.tilesAccessToken
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

        //group and render all sensors from all stations
        marker.stations.forEach(
          station => {
            station.sensors.forEach(
              sensor => {


                //gets a shared sensor id from the url, selects this sensor and its station, and centers the map on it
                const params = getParams()
                if (params.id && params.id === sensor.id && !this.centeredOnSensorFromURL && (nextProps.appState.stationList !== [station])) {

                  this.isMoving = true
                  setParams(params)
                  this.centerOnCoords(
                    {
                      lat: station.latitude,
                      lng: station.longitude
                    },
                    14
                  )
                  delete params.lat
                  delete params.lng
                  delete params.zoom
                  if (!this.centeredOnSensorFromURL && (this.props.appState.stationList === null || this.props.appState.stationList.length > 1 || (this.props.appState.stationList.length === 1 && this.props.appState.stationList[0].id !== params.id))) {
                    this.centeredOnSensorFromURL = true
                    this.props.onChangeCurrentStation([station])
                    this.props.onChangeCurrentSensor(sensor.id)
                  }
                }

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
        const valueLower = phenomenonMeta.data[Math.max(0, valueExceedsIndex - 1)].value
        const valueUpper = phenomenonMeta.data[Math.max(0, valueExceedsIndex)].value - valueLower
        const valuePercent = Math.min(100,Math.max(0,(meanValue - valueLower) / valueUpper))
        const colorLower = phenomenonMeta.data[Math.max(0, valueExceedsIndex - 1)].color
        const colorUpper = phenomenonMeta.data[Math.max(0, valueExceedsIndex)].color
        const colorBlend = blendColors(colorLower, colorUpper, valuePercent)

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

    if(this.props.appState.id !== nextProps.appState.id && nextProps.appState.id === null) {
      const params = getParams()
      delete params.id
      setParams(params)
    }


    //TODO fix this mess
    if(nextProps.appState.id !== this.props.appState.id && nextProps.appState.id !== null) {
      console.log('setting ID')
      setParams({
        id: nextProps.appState.id
      })
      this.centeredOnSensorFromURL = false
      // this.props.onSetID(null)
    }


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
    stations: state.stationUpdates.stations
  }

}

const mapDispatchToProps = dispatch => {
  return {
    onChangeCurrentStation: stationList => {
      dispatch(setCurrentStationList(stationList))
    },
    onChangeCurrentSensor: sensor => {
      dispatch(setCurrentSensor(sensor))
    },
    onSetMapCoords: coords => {
      dispatch(setMapCoords(coords))
    },
    onSetID: id => {
      dispatch(setID(id))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map)

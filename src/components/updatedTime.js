import React from 'react'
import { connect } from 'react-redux'


const UpdatedTime = ({time, lang}) =>
  <div className="updated-time">{(time === null ) ? lang.updating : lang.lastUpdated + ' ' + time}</div>




const mapStateToProps = state => {
  return {
    time: state.appState.time,
    lang: state.appState.lang
  }
}


export default connect(mapStateToProps)(UpdatedTime)
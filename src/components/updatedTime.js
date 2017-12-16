import React, { Component } from 'react'
import { connect } from 'react-redux'


const UpdatedTime = ({time}) =>
  <div className="updated-time" style={{display: (time !== null ) ? 'flex' : 'none' }}>Last updated {time}</div>




const updatedTimeStateToProps = state => {
  return {
    time: state.appState.time
  }
}


export default connect(updatedTimeStateToProps)(UpdatedTime)
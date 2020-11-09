import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setPhenomenon } from '../redux/appState/actions'

class PhenomenonPicker extends Component {
  UNSAFE_componentWillMount () {
    this.setState(
      {
        phenomenaKeys: Object.keys(this.props.phenomenonMeta).map(key => key),
        phenomenaNames: Object.keys(this.props.phenomenonMeta).map(key => this.props.phenomenonMeta[key].name),
        display: 'none'
      }
    )
  }

  toggle = () => {
    const display = (this.state.display === 'none') ? 'flex' : 'none'
    this.setState(
      {
        display: display
      }
    )
  }

  changePhenomenon = (phenomenon) => {
    this.toggle()
    this.props.onChangePhenomenon(phenomenon)
  }

  render () {
    return (
      <div className="phenomenon-picker">
        <ul className="dropdown" style={{ display: this.state.display }}>
          {
            this.state.phenomenaNames.map(
              (phenomenon, index) => {
                return <li key={index}
                           className={this.state.phenomenaKeys[index] === this.props.phenomenon ? 'selected' : 'option'}
                           style={
                  { display: (this.state.phenomenaKeys[index] === this.props.phenomenon) ? 'none' : 'flex' }
                }
                           onClick={() => this.changePhenomenon(this.state.phenomenaKeys[index])}>{phenomenon}</li>
              }
            )
          }
        </ul>
        <div className="current" onClick={this.toggle}>
          <span>
            {this.props.phenomenonMeta[this.props.phenomenon].name}
          </span>
          <span className="arrow">
            {(this.state.display === 'none') ? '\u25B2' : '\u25BC'}
          </span>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    phenomenon: state.appState.phenomenon,
    phenomenonMeta: state.appState.phenomenonMeta
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onChangePhenomenon: (phenomenon) => {
      dispatch(setPhenomenon(phenomenon))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PhenomenonPicker)

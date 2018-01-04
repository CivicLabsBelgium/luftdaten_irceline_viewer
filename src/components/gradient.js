import React, { Component } from 'react'
import { connect } from 'react-redux'

class Gradient extends Component {

  render () {
    const nodeSize = 50
    const currentPhenomenonMeta = this.props.phenomenonMeta[this.props.phenomenon]
    const height = (currentPhenomenonMeta.values.length-1) * nodeSize + 1

    const gradient = ['linear-gradient(to top'].concat(
      currentPhenomenonMeta.colors.map((color, index) => color + ' ' + (index * nodeSize) + 'px')
    ).join(', ').concat(')')

    const gradientStyle = {
      height: height + 'px',
      background: gradient
    }

    const limitBarExceedsIndex = currentPhenomenonMeta.values.indexOf(
      (currentPhenomenonMeta.values.find(
        (value) => {
          return value >= currentPhenomenonMeta.max
        }
      ) || currentPhenomenonMeta.values[currentPhenomenonMeta.values.length - 1]))

    const limitBarPos = (limitBarExceedsIndex === 0)? 0 : (
        (nodeSize*limitBarExceedsIndex) -
        (nodeSize / (currentPhenomenonMeta.values[limitBarExceedsIndex] - currentPhenomenonMeta.values[limitBarExceedsIndex-1]))
        * (currentPhenomenonMeta.values[limitBarExceedsIndex] - currentPhenomenonMeta.max)
    )


    const limitBarStyle = {
      bottom: limitBarPos-1 + 'px'
    }

    return (
      <div style={{position: 'relative'}}>
        <div className="color-gradient" style={gradientStyle}>
          <div className="limit-bar" style={limitBarStyle}/>

          {
            currentPhenomenonMeta.values.map(
              (label, index) => {
                const labelBottom = (index * nodeSize - 10) + 'px'

                const labelStyle = {
                  bottom: labelBottom,
                }

                return <div key={index} className="labelValue" style={labelStyle}>{label}</div>
              }
            )
          }
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

export default connect(mapStateToProps)(Gradient)
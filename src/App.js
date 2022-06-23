import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import Header from './components/Header/Header'
import L, { divIcon } from "leaflet";
import { MapContainer, 
         TileLayer, 
         useMap,
         Marker,
         Popup } 
from 'react-leaflet'
import equipmentPositionHistory from './data/equipmentPositionHistory.json'
import equipmentStateHistory from './data/equipmentStateHistory.json'
import equipmentState from './data/equipmentState.json'
import equipment from './data/equipment.json'
import equipmentModel from './data/equipmentModel.json'


import { FaMapPin, FaTractor, FaTruckMonster, FaTruckMoving, FaTruckPickup } from 'react-icons/fa';
import { renderToStaticMarkup } from 'react-dom/server';
import getMostRecentData from './utils/getMostRecentData'
import './App.css'


const App = () => {

  const [markerInfo, setMarkerInfo] = useState([])
  const [equipmentName, setEquipmentName] = useState('')


  const getClosestCoordinates = (positions) => {
    const currentPosition = getMostRecentData(positions)
    return [currentPosition.lat, currentPosition.lon]
  }

  const renderPopupMessage = (equipmentId) => {
    const state = getCurrentRecentEquipmentState(equipmentId)
    return (
      <h4>{state.name}</h4>
    );
  }

  const switchModelName = (equipmentModelName, state) => {
    switch (equipmentModelName.name) {
      case 'Caminhão de carga':
        return <FaTruckMoving className='no' color={state.color} size={30}/>
      case 'Harvester':
        return <FaTruckPickup className='no' color={state.color} size={30}/>
      case 'Garra traçadora':
        return <FaTractor className='no' color={state.color} size={30}/>
      default:
        break;
    }
  }

  const renderMarkerIcon = (equipmentId) => {
    const state = getCurrentRecentEquipmentState(equipmentId)
    const currentEquipmentModel = equipment.filter(item => item.id === equipmentId)[0]
    const equipmentModelName = equipmentModel.filter(item => item.id === currentEquipmentModel.equipmentModelId)[0]
    const icon = switchModelName(equipmentModelName, state)
    const iconMarkup = renderToStaticMarkup(icon);
    const customMarkerIcon = divIcon({
      html: iconMarkup,
      className: 'divIcon',
      iconSize: 50
    });
    return customMarkerIcon
  }

  const getCurrentRecentEquipmentState = (equipmentId) => {
    const currentIdStates = equipmentStateHistory.filter(item => item.equipmentId === equipmentId)
    const mostRecentState = getMostRecentData(currentIdStates[0].states)
    const currentState = equipmentState.filter(item=> item.id === mostRecentState.equipmentStateId)

    return currentState[0]

  }

  const getCurrentState = (equipmentId) => {
    const currentState = equipmentState.filter(item=> item.id === equipmentId)[0]
    return currentState.name
  } 

  const handleMarkerClick = (equipmentId) => {
    const currentIdStates = equipmentStateHistory.filter(item => item.equipmentId === equipmentId)[0].states
    const currentState = equipmentState.map(item => item.id === currentIdStates.equipmentStateId)
    equipment.map(item => item.id === equipmentId ? setEquipmentName(item.name) : null)
    setMarkerInfo([])
    currentIdStates.map(item => setMarkerInfo( previousState => [...previousState, { date: item.date, stateId: item.equipmentStateId}]))
  }

  const renderMap = () => {
    if(!equipmentPositionHistory) {
      return null;
    }
    const centerCoordinates = [equipmentPositionHistory[0].positions[2].lat, equipmentPositionHistory[0].positions[2].lon]
    return (
      <MapContainer center={centerCoordinates} zoom={10} scrollWheelZoom={true} style={{flex: 1}}>
        <TileLayer  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          {equipmentPositionHistory.map(equipment=>(  
            <Marker key={equipment.equipmentId}
                    icon={renderMarkerIcon(equipment.equipmentId)}
                    position={getClosestCoordinates(equipment.positions)}
                    eventHandlers={{ 
                      mouseover: (event) => event.target.openPopup(),
                      mouseout: (event) => event.target.closePopup(),
                      click: (event) => handleMarkerClick(equipment.equipmentId)
                    }}
                    riseOnHover>
                <Popup>
                  {renderPopupMessage(equipment.equipmentId)}
                </Popup>      
            </Marker>))}
      </MapContainer>
    )
  }
  return (
    <div>
        <Header/>
        <div className='home-container'>
          <div className='info-container'>
            <h3>Histórico do equipamento {equipmentName}: </h3>
            <div className='history-container'>
            {markerInfo.map(item => (
              <table>
              <tr>
                <th>{item.date}</th>
                <th>{getCurrentState(item.stateId)}</th>
              </tr>
              </table>
            ))}
            </div> 
          </div>  
          <div className='map-container'>
            {renderMap()}
          </div>
        </div>
    </div>
  )
}

export default App

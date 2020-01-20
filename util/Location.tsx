module.exports = {
    getRegion(lat, lon, Radius) {
        const oneDegreeOfLongitudeInMeters = 111.32 * 1000;
        const latitudeDelta = Radius / (oneDegreeOfLongitudeInMeters * Math.cos(lat * (Math.PI / 180)));
        const longitudeDelta =Radius / oneDegreeOfLongitudeInMeters;

        return {
           latitude: lat,
           longitude: lon,
           latitudeDelta,
           longitudeDelta,
        }
    },

    getRadius(longitudeDelta) {
        const oneDegreeOfLatitudeInMeters = 111.32 * 1000
        return longitudeDelta * oneDegreeOfLatitudeInMeters
    },
    
    coordinate2string(coordinate){
        if(coordinate.latitude)
            return coordinate.latitude + "," + coordinate.longitude
        else
            return coordinate.lat + "," + coordinate.lng
    },

    generateFlightRoute(origin, dest) {
        return {
          route:{
            overview_polyline:{
              points:[{
                latitude:origin.stop.stopDetail.geometry.location.lat,
                longitude:origin.stop.stopDetail.geometry.location.lng
              },{
                latitude:dest.stop.stopDetail.geometry.location.lat,
                longitude:dest.stop.stopDetail.geometry.location.lng
              }]
            },
            legs:[
              {
                distance: {text:null, value: null},
                duration: {text:null, value: null},
                start_address: origin.stop.stopDetail.formatted_address,
                end_address: dest.stop.stopDetail.formatted_address
              }
            ]
          },
          destination: dest.stop.stopDetail.place_id,
          origin: origin.stop.stopDetail.place_id,
          originStopIndex: origin.index,
          destStopIndex: dest.index,
          routeable: false,
          privacy: (typeof origin.stop.privacy !== 'undefined' && origin.stop.privacy) || (typeof dest.stop.privacy !== 'undefined' && dest.stop.privacy)
        }
      }
}
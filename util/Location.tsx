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
    }
}
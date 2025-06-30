document.querySelector('.mapstyles-select').addEventListener('change', (e) => {
  const style_code = e.target.value.split(".");
  style_code.length === 2 ? map.setStyle(maptilersdk.MapStyle[style_code[0]][style_code[1]]) : map.setStyle(maptilersdk.MapStyle[style_code[0]]);
});
maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    center: camp.geometry.coordinates, // starting position [lng, lat]
    zoom: 13 // starting zoom
});

new maptilersdk.Marker()
    .setLngLat(camp.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${camp.title}</h3><p>${camp.location}</p>`
            )
    )
    .addTo(map)
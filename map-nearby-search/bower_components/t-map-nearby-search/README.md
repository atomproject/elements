#t-map-nearby-search

t-map-nearby-search is a variant of google-map-seach component to perform google places API `nearbysearch` by using given `types` and `keyword`. This is majorly inspired from google-map-search only except places API changes and few properties and events.

`<template is="dom-bind">
  <t-map-nearby-search map="[[map]]" keyword="" types="['atm', 'bank']" results="{{results}}" radius="5000" fit-to-markers>
  </t-map-nearby-search>
  <google-map map="{{map}}" latitude="37.779"
              longitude="-122.3892">
    <template is="dom-repeat" items="{{results}}" as="marker">
      <google-map-marker latitude="{{marker.latitude}}"
                         longitude="{{marker.longitude}}">
        <h2>{{marker.name}}</h2>
        <span>{{marker.formatted_address}}</span>
      </google-map-marker>
    </template>
  </google-map>
</template>`

 
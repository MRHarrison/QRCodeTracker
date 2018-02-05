pragma solidity ^0.4.11;
/// @title QRCodeTracking with delegation.
contract QRCodeTracking {
    struct Location {
        address delegate;
        bytes32 longitude;
        bytes32 latitude;
        uint timestamp;
        bytes32 name;
    }

    struct Item {
        bytes32 id;
        bytes32 name;
    }

    Item public item;

    Location[] public locations;

    function QRCodeTracking(bytes32 id, bytes32 name) public {
        item = Item({id: id, name: name});
    }

    function saveLocation (
        bytes32 longitude,
        bytes32 latitude,
        bytes32 name
    ) public {

        locations.push(Location({
            delegate: msg.sender,
            longitude: longitude,
            latitude: latitude,
            timestamp: now,
            name: name
        }));

    }

    function getLocationHistory(uint idx) public constant
        returns (
            address delegate,
            bytes32 longitude,
            bytes32 latitude,
            uint timestamp,
            bytes32 name
        ) {

        Location storage loc = locations[idx];

        return (loc.delegate, loc.longitude, loc.latitude, loc.timestamp, loc.name);
    }


    function getLocationLength() public constant
        returns (
            uint count
        ) {

        return locations.length;
    }
}
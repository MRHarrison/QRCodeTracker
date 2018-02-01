pragma solidity ^0.4.11;
/// @title QRCodeTracking with delegation.
contract QRCodeTracking {
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Location {
        address delegate; // scanner delegated to
        uint128 longitude; // weight is accumulated by delegation
        uint128 latitude; // weight is accumulated by delegation
        bytes32 name;   // index of the voted proposal
    }

    // This is a type for a single proposal.
    struct Item {
        bytes32 id;   // short name (up to 128 bytes)
        bytes32 name;   // short name (up to 32 bytes)
    }

    Item public item;

    // A dynamically-sized array of `Location` structs.
    Location[] public locations;
    Location public recentLocation;
    /// Create a new ballot to choose one of `proposalNames`.
    function QRCodeTracking(bytes32 id, bytes32 name) public {
        // Limit gas
        locations.length = 100;

        item = Item({id: id, name: name});
    }

    function saveLocation (
        uint128 longitude,
        uint128 latitude,
        bytes32 name
    ) public constant {

        locations.push(Location({
            delegate: msg.sender,
            longitude: longitude,
            latitude: latitude,
            name: name
        }));

    }

    function getLocationHistory(uint idx) public
        returns (address delegate, uint128 longitude, uint128 latitude, bytes32 name) {

        Location storage loc = locations[idx];

        return (loc.delegate, loc.longitude, loc.latitude, loc.name);
    }

    function getLastLocation() public
        returns (Location recentLocation) {
        recentLocation = locations[locations.length - 1];

        return recentLocation;
    }
}
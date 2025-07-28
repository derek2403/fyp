// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReviewContract {
    struct Review {
        string id;
        string userId;
        string merchantId;
        string username;
        string restaurantName;
        uint8  rating;
        string reviewText;
        string date;
        uint256 upvotes;
        uint256 downvotes;
        uint256 confidenceScore;
        string createdAt;
        uint8  foodQuality;
        uint8  service;
        uint8  atmosphere;
        uint8  value;
        string orderId;
        uint256 orderTotal;
        string updatedAt;
    }

    /// Collapse all inputs into one calldata struct
    struct ReviewInput {
        string id;
        string userId;
        string merchantId;
        string username;
        string restaurantName;
        uint8  rating;
        string reviewText;
        string date;
        uint256 upvotes;
        uint256 downvotes;
        uint256 confidenceScore;
        string createdAt;
        uint8  foodQuality;
        uint8  service;
        uint8  atmosphere;
        uint8  value;
        string orderId;
        uint256 orderTotal;
        string updatedAt;
    }

    mapping(bytes32 => Review) private reviews;
    bytes32[]             private reviewKeys;

    event ReviewAdded(string indexed id);

    /// Now takes exactly one calldata param (`data`), plus two locals internally
    function addReview(ReviewInput calldata data) external {
        bytes32 key = keccak256(abi.encodePacked(data.id));
        require(bytes(reviews[key].id).length == 0, "Review already exists");

        Review storage r = reviews[key];
        r.id              = data.id;
        r.userId          = data.userId;
        r.merchantId      = data.merchantId;
        r.username        = data.username;
        r.restaurantName  = data.restaurantName;
        r.rating          = data.rating;
        r.reviewText      = data.reviewText;
        r.date            = data.date;
        r.upvotes         = data.upvotes;
        r.downvotes       = data.downvotes;
        r.confidenceScore = data.confidenceScore;
        r.createdAt       = data.createdAt;
        r.foodQuality     = data.foodQuality;
        r.service         = data.service;
        r.atmosphere      = data.atmosphere;
        r.value           = data.value;
        r.orderId         = data.orderId;
        r.orderTotal      = data.orderTotal;
        r.updatedAt       = data.updatedAt;

        reviewKeys.push(key);
        emit ReviewAdded(data.id);
    }

    function getReview(string calldata id) external view returns (Review memory) {
        bytes32 key = keccak256(abi.encodePacked(id));
        require(bytes(reviews[key].id).length != 0, "Not found");
        return reviews[key];
    }

    function getAllReviews() external view returns (Review[] memory) {
        Review[] memory list = new Review[](reviewKeys.length);
        for (uint256 i = 0; i < reviewKeys.length; i++) {
            list[i] = reviews[reviewKeys[i]];
        }
        return list;
    }

    function totalReviews() external view returns (uint256) {
        return reviewKeys.length;
    }
}
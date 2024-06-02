// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

contract StudentDb {
    struct Student {
        string name;
        uint256 enrollment;
    }

    address public owner; // Only owner can add & delete new admins
    uint256 public studentCount; // Useful to get student count in frontend
    mapping(address => bool) public admins; // Useful to check if a person is an admin
    mapping(uint256 => Student) public students; // Store students & retrieve students by index

    constructor() {
        owner = msg.sender;
        studentCount = 0;
        admins[msg.sender] = true; // Initializing the deployer as an admin
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] == true, "You are not an admin");
        _;
    }

    // Only owner can call
    function addAdmin(address newAdmin) public onlyOwner {
        admins[newAdmin] = true;
    }

    // Only owner can call
    function deleteAdmin(address admin) public onlyOwner {
        admins[admin] = false;
    }

    // Only admin can call
    function addStudent(
        string memory name,
        uint256 enrollment
    ) public onlyAdmin {
        studentCount++;
        students[studentCount] = Student(name, enrollment);
    }

    // Only admin can call
    function deleteStudent(uint256 index) public onlyAdmin {
        require(index > 0 && index <= studentCount, "Invalid student index");

        // Shift students down by one index to fill the gap left by the deleted student
        for (uint256 i = index; i < studentCount; i++) {
            students[i] = students[i + 1];
        }

        // Delete the last student and decrement the studentCount
        delete students[studentCount];
        studentCount--;
    }
}

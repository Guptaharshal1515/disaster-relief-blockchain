// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Utility
 * @dev Shared utility library providing arithmetic safety and validation helpers.
 */
library Utility {
    /**
     * @dev Checks if an address is valid (non-zero).
     * @param user The address to validate.
     * @return bool True if valid, false otherwise.
     */
    function isValidPrincipal(address user) internal pure returns (bool) {
        return user != address(0);
    }

    /**
     * @dev Adds two numbers, reverts on overflow.
     * @param a First number.
     * @param b Second number.
     * @return uint256 Sum of a and b.
     */
    function safeAdd(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "Utility: addition overflow");
        return c;
    }

    /**
     * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
     * @param a First number.
     * @param b Second number.
     * @return uint256 Difference of a and b.
     */
    function safeSubtract(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "Utility: subtraction overflow");
        return a - b;
    }

    /**
     * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
     * reverts when dividing by zero.
     * @param a First number.
     * @param b Second number.
     * @return uint256 Quotient of a divided by b.
     */
    function safeDivide(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "Utility: division by zero");
        return a / b;
    }
}

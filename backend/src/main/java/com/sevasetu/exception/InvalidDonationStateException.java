// exception/InvalidDonationStateException.java
package com.sevasetu.exception;

public class InvalidDonationStateException extends RuntimeException {
    public InvalidDonationStateException(String message) {
        super(message);
    }
}
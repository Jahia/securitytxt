package org.jahia.community.securitytxt;

import org.apache.commons.lang.StringUtils;

import java.util.regex.Pattern;

/**
 * Pure, side-effect-free validation of the user-controlled string fields that end up
 * inside the served {@code security.txt} file (RFC 9116).
 *
 * <p>The served file is built directly from these field values, so any unvalidated
 * CR/LF could forge extra {@code security.txt} directives (newline injection), and an
 * arbitrary URI scheme could point a directive at an unexpected target. Centralising
 * the rules here keeps them testable in isolation from the JCR layer.</p>
 */
public final class SecurityTxtFieldValidator {

    /** Matches a {@code mailto:} or {@code https:} URI for the Contact field (RFC 9116). */
    private static final Pattern CONTACT_PATTERN =
            Pattern.compile("^(mailto:[^\\s]+|https://[^\\s]+)$");
    /** Matches an {@code https:} or {@code mailto:} URI for URL fields. */
    private static final Pattern URL_FIELD_PATTERN =
            Pattern.compile("^(https://[^\\s]+|mailto:[^\\s]+)$");
    /** CR or LF characters that must never appear in a field value. */
    private static final Pattern CRLF_PATTERN = Pattern.compile("[\\r\\n]");

    private SecurityTxtFieldValidator() {
        // Utility class — not instantiable.
    }

    /**
     * @return {@code true} if {@code value} is {@code null} or contains no CR/LF character.
     */
    public static boolean isFreeOfCrlf(String value) {
        return value == null || !CRLF_PATTERN.matcher(value).find();
    }

    /**
     * @return {@code true} if {@code value} is blank (nothing to validate) or a valid
     *         {@code mailto:}/{@code https:} contact URI.
     */
    public static boolean isValidContact(String value) {
        return StringUtils.isBlank(value) || CONTACT_PATTERN.matcher(value.trim()).matches();
    }

    /**
     * @return {@code true} if {@code value} is blank (optional field) or a valid
     *         {@code https:}/{@code mailto:} URI.
     */
    public static boolean isValidUrlField(String value) {
        return StringUtils.isBlank(value) || URL_FIELD_PATTERN.matcher(value.trim()).matches();
    }

    /**
     * Validates a single field for CR/LF injection.
     *
     * @throws IllegalArgumentException if {@code value} contains a CR or LF character.
     */
    public static void requireFreeOfCrlf(String fieldName, String value) {
        if (!isFreeOfCrlf(value)) {
            throw new IllegalArgumentException(
                    "Invalid value for field '" + fieldName + "': CR/LF characters are not allowed");
        }
    }

    /**
     * Validates the {@code contact} field shape.
     *
     * @throws IllegalArgumentException if {@code value} is non-blank and not a mailto:/https: URI.
     */
    public static void requireValidContact(String value) {
        if (!isValidContact(value)) {
            throw new IllegalArgumentException(
                    "Invalid contact value: must be a mailto: or https: URI");
        }
    }

    /**
     * Validates an optional URL field shape.
     *
     * @throws IllegalArgumentException if {@code value} is non-blank and not an https:/mailto: URI.
     */
    public static void requireValidUrlField(String fieldName, String value) {
        if (!isValidUrlField(value)) {
            throw new IllegalArgumentException(
                    "Invalid value for field '" + fieldName + "': must be an https: or mailto: URI");
        }
    }
}

package org.jahia.community.securitytxt;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatCode;

/**
 * Unit tests for {@link SecurityTxtFieldValidator}, the security-critical sanitization
 * applied to every user-controlled field before it is stored and served in security.txt.
 */
public class SecurityTxtFieldValidatorTest {

    // --- CR/LF injection ---

    @Test
    public void isFreeOfCrlf_returnsTrueForNull() {
        // Arrange / Act / Assert
        assertThat(SecurityTxtFieldValidator.isFreeOfCrlf(null)).isTrue();
    }

    @Test
    public void isFreeOfCrlf_returnsTrueForPlainValue() {
        assertThat(SecurityTxtFieldValidator.isFreeOfCrlf("mailto:security@example.com")).isTrue();
    }

    @Test
    public void isFreeOfCrlf_returnsFalseForCarriageReturn() {
        assertThat(SecurityTxtFieldValidator.isFreeOfCrlf("mailto:a@b.com\rPolicy: evil")).isFalse();
    }

    @Test
    public void isFreeOfCrlf_returnsFalseForLineFeed() {
        assertThat(SecurityTxtFieldValidator.isFreeOfCrlf("mailto:a@b.com\nPolicy: evil")).isFalse();
    }

    @Test
    public void requireFreeOfCrlf_throwsForInjectedNewline() {
        assertThatThrownBy(() ->
                SecurityTxtFieldValidator.requireFreeOfCrlf("contact", "x\r\nExpires: 1999-01-01"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("contact")
                .hasMessageContaining("CR/LF");
    }

    @Test
    public void requireFreeOfCrlf_doesNotThrowForCleanValue() {
        assertThatCode(() ->
                SecurityTxtFieldValidator.requireFreeOfCrlf("contact", "https://example.com/report"))
                .doesNotThrowAnyException();
    }

    // --- Contact field shape ---

    @Test
    public void isValidContact_acceptsMailtoUri() {
        assertThat(SecurityTxtFieldValidator.isValidContact("mailto:security@example.com")).isTrue();
    }

    @Test
    public void isValidContact_acceptsHttpsUri() {
        assertThat(SecurityTxtFieldValidator.isValidContact("https://example.com/report")).isTrue();
    }

    @Test
    public void isValidContact_acceptsBlankAsOptional() {
        assertThat(SecurityTxtFieldValidator.isValidContact("")).isTrue();
        assertThat(SecurityTxtFieldValidator.isValidContact(null)).isTrue();
        assertThat(SecurityTxtFieldValidator.isValidContact("   ")).isTrue();
    }

    @Test
    public void isValidContact_rejectsHttpScheme() {
        assertThat(SecurityTxtFieldValidator.isValidContact("http://insecure.example.com")).isFalse();
    }

    @Test
    public void isValidContact_rejectsBareEmail() {
        assertThat(SecurityTxtFieldValidator.isValidContact("security@example.com")).isFalse();
    }

    @Test
    public void isValidContact_rejectsValueWithWhitespace() {
        assertThat(SecurityTxtFieldValidator.isValidContact("https://example.com/a b")).isFalse();
    }

    @Test
    public void requireValidContact_throwsForInvalidScheme() {
        assertThatThrownBy(() -> SecurityTxtFieldValidator.requireValidContact("javascript:alert(1)"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("mailto:")
                .hasMessageContaining("https:");
    }

    // --- URL field shape ---

    @Test
    public void isValidUrlField_acceptsHttpsUri() {
        assertThat(SecurityTxtFieldValidator.isValidUrlField("https://example.com/policy")).isTrue();
    }

    @Test
    public void isValidUrlField_acceptsMailtoUri() {
        assertThat(SecurityTxtFieldValidator.isValidUrlField("mailto:team@example.com")).isTrue();
    }

    @Test
    public void isValidUrlField_acceptsBlankAsOptional() {
        assertThat(SecurityTxtFieldValidator.isValidUrlField(null)).isTrue();
        assertThat(SecurityTxtFieldValidator.isValidUrlField("")).isTrue();
    }

    @Test
    public void isValidUrlField_rejectsHttpScheme() {
        assertThat(SecurityTxtFieldValidator.isValidUrlField("http://insecure.example.com")).isFalse();
    }

    @Test
    public void isValidUrlField_rejectsRelativePath() {
        assertThat(SecurityTxtFieldValidator.isValidUrlField("/policy")).isFalse();
    }

    @Test
    public void requireValidUrlField_throwsForInvalidValueWithFieldName() {
        assertThatThrownBy(() ->
                SecurityTxtFieldValidator.requireValidUrlField("policyUrl", "ftp://example.com/p"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("policyUrl");
    }

    @Test
    public void requireValidUrlField_doesNotThrowForBlank() {
        assertThatCode(() -> SecurityTxtFieldValidator.requireValidUrlField("policyUrl", null))
                .doesNotThrowAnyException();
    }
}

<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="user" uri="http://www.jahia.org/tags/user" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="mailSettings" type="org.jahia.services.mail.MailSettings"--%>
<%--@elvariable id="flowRequestContext" type="org.springframework.webflow.execution.RequestContext"--%>
<%--@elvariable id="flowExecutionUrl" type="java.lang.String"--%>
<%--@elvariable id="issueTemplate" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="issue" type="org.jahia.services.content.JCRNodeWrapper"--%>
<c:set target="${renderContext}" property="contentType" value="text/plain;charset=UTF-8"/>
<c:if test="${not empty currentNode.properties['contact']}">
Contact: ${currentNode.properties['contact']}
</c:if>

<c:if test="${not empty currentNode.properties['expires']}">
Expires: ${currentNode.properties['expires']}
</c:if>

<c:if test="${not empty currentNode.properties['acknowledgments']}">
Acknowledgments: ${url.server}<c:url value="${currentNode.properties['acknowledgments'].node.url}"/>
</c:if>

<c:if test="${not empty currentNode.properties['canonical']}">
Canonical: ${currentNode.properties['canonical']}
</c:if>

<c:if test="${not empty currentNode.properties['encryption']}">
Encryption: ${url.server}<c:url value="${currentNode.properties['encryption'].node.url}"/>
</c:if>

<c:if test="${not empty currentNode.properties['hiring']}">
Hiring: ${url.server}<c:url value="${currentNode.properties['hiring'].node.url}"/>
</c:if>

<c:if test="${not empty currentNode.properties['policy']}">
Policy: ${url.server}<c:url value="${currentNode.properties['policy'].node.url}"/>
</c:if>

<c:if test="${not empty currentNode.properties['preferredLanguages']}">
Preferred-Languages: ${currentNode.properties['preferredLanguages']}
</c:if>

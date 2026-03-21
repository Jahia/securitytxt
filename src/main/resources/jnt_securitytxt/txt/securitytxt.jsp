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
<c:if test="${currentNode.properties['contact'] ne ''}">
Contact: ${currentNode.properties['contact']}
</c:if>

<c:if test="${currentNode.properties['expires'] ne ''}">
Expires: ${currentNode.properties['expires']}
</c:if>

<c:if test="${currentNode.properties['acknowledgments'] ne ''}">
Acknowledgments: ${url.server}<c:url value="${currentNode.properties['acknowledgments'].node.url}"/>
</c:if>

<c:if test="${currentNode.properties['canonical'] ne ''}">
Canonical: ${currentNode.properties['canonical']}
</c:if>

<c:if test="${currentNode.properties['encryption'] ne ''}">
Encryption: ${url.server}<c:url value="${currentNode.properties['encryption'].node.url}"/>
</c:if>

<c:if test="${currentNode.properties['hiring'] ne ''}">
Hiring: ${url.server}<c:url value="${currentNode.properties['hiring'].node.url}"/>
</c:if>

<c:if test="${currentNode.properties['policy'] ne ''}">
Policy: ${url.server}<c:url value="${currentNode.properties['policy'].node.url}"/>
</c:if>

<c:if test="${currentNode.properties['preferredLanguages'] ne ''}">
Preferred-Languages: ${currentNode.properties['preferredLanguages']}
</c:if>

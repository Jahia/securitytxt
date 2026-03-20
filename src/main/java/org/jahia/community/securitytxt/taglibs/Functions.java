package org.jahia.modules.securitytxt.taglibs;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import javax.jcr.RepositoryException;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRPropertyWrapper;
import org.jahia.services.render.RenderContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Functions {

    private static final Logger LOGGER = LoggerFactory.getLogger(Functions.class);

    private Functions() {
    }

    public static boolean downloadBinaryContent(RenderContext renderContext, JCRNodeWrapper nodeToDownload) {
        try (OutputStream outputStream = renderContext.getResponse().getOutputStream()) {
            if (nodeToDownload.hasNode("jcr:content")) {
                final JCRNodeWrapper jcrContent = nodeToDownload.getNode("jcr:content");
                if (jcrContent.hasProperty("jcr:data")) {
                    final JCRPropertyWrapper jcrData = jcrContent.getProperty("jcr:data");
                    try (InputStream inputStream = jcrData.getValue().getBinary().getStream()) {
                        byte[] buf = new byte[32 * 1024]; // 32k buffer
                        int nRead = 0;
                        while ((nRead = inputStream.read(buf)) != -1) {
                            outputStream.write(buf, 0, nRead);
                        }
                        outputStream.flush();
                    }
                }
            }
        } catch (IOException | RepositoryException ex) {
            LOGGER.error("Impossible to download file " + nodeToDownload.getPath(), ex);
            return Boolean.FALSE;
        }
        return Boolean.TRUE;
    }
}

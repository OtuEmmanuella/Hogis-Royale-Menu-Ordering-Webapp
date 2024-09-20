import React, { useEffect } from 'react';

const BrevoConversationsWidget = () => {
  useEffect(() => {
    // Load Brevo Conversations script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(d, w, c) {
        w.BrevoConversationsID = '66ce29eebe00513d87073f1f';
        w[c] = w[c] || function() {
            (w[c].q = w[c].q || []).push(arguments);
        };
        var s = d.createElement('script');
        s.async = true;
        s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
        if (d.head) d.head.appendChild(s);
      })(document, window, 'BrevoConversations');
    `;
    script.async = true;
    document.body.appendChild(script);

    // Function to apply custom styles
    const applyCustomStyles = () => {
      const widgetContainer = document.querySelector('#brevo-conversations-widget');
      if (widgetContainer) {
        widgetContainer.style.right = '20px';
        widgetContainer.style.bottom = '50%';
        widgetContainer.style.transform = 'translateY(50%)';
        clearInterval(checkWidgetInterval);
      }
    };

    // Check for widget every 100ms
    const checkWidgetInterval = setInterval(applyCustomStyles, 100);

    return () => {
      // Clean up
      clearInterval(checkWidgetInterval);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default BrevoConversationsWidget;
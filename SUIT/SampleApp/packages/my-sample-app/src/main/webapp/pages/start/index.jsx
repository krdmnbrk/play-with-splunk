import React from 'react';

import layout from '@splunk/react-page';
import SampleAppComponent from '@splunk/sample-app-component';
import { getUserTheme } from '@splunk/splunk-utils/themes';

import { StyledContainer, StyledGreeting } from './StartStyles';

getUserTheme()
    .then((theme) => {
        layout(
            <StyledContainer>
                <StyledGreeting>Hello, from inside MySampleApp!</StyledGreeting>
                <div>Your component will appear below.</div>
                <SampleAppComponent name="from inside SampleAppComponent" />
            </StyledContainer>,
            {
                theme,
            }
        );
    })
    .catch((e) => {
        const errorEl = document.createElement('span');
        errorEl.innerHTML = e;
        document.body.appendChild(errorEl);
    });

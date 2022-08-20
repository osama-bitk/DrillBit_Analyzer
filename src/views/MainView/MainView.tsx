import React, { useState } from 'react';
import './MainView.scss';
import classNames from 'classnames';

import ImagesDropZone from './ImagesDropZone/ImagesDropZone';

const MainView: React.FC = () => {
    const projectInProgress = useState(true);



    const getClassName = () => {
        return classNames(
            'MainView', {
            'InProgress': projectInProgress,
            'Canceled': !projectInProgress,
        }
        );
    };

    return (
        <div className={getClassName()}>

            <div className='LeftColumn'>
                <div className={'LogoWrapper'}>
                </div>

                <div className='TriangleVertical'>
                    <div className='TriangleVerticalContent' />
                </div>
            </div>
            <div className='RightColumn'>
                <div />
                <ImagesDropZone />
            </div>
        </div>
    );
};

export default MainView;

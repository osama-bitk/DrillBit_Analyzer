import React, { useState } from 'react';
import './MainView.scss';
import { TextButton } from '../Common/TextButton/TextButton';
import classNames from 'classnames';
import { ISize } from '../../interfaces/ISize';
import { ImageButton } from '../Common/ImageButton/ImageButton';
import { ISocialMedia, SocialMediaData } from '../../data/info/SocialMediaData';
import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import Fade from '@mui/material/Fade';
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

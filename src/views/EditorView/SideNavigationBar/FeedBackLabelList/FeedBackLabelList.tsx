import React from 'react';
import {ISize} from '../../../../interfaces/ISize';
import Scrollbars from 'react-custom-scrollbars-2';
import {ImageData, LabelName, LabelFeedback} from '../../../../store/labels/types';
import './FeedBackLabelList.scss';
import {
    updateActiveLabelId,
    updateActiveLabelNameId,
    updateImageDataById
} from '../../../../store/labels/actionCreators';
import {AppState} from '../../../../store';
import {connect} from 'react-redux';
import LabelInputField from '../LabelInputField/LabelInputField';
import EmptyLabelList from '../EmptyLabelList/EmptyLabelList';
import {LabelActions} from '../../../../logic/actions/LabelActions';
import {findLast} from 'lodash';
import {LabelStatus} from '../../../../data/enums/LabelStatus';

interface IProps {
    size: ISize;
    imageData: ImageData;
    updateImageDataByIdAction: (id: string, newImageData: ImageData) => any;
    activeLabelId: string;
    highlightedLabelId: string;
    updateActiveLabelNameIdAction: (activeLabelId: string) => any;
    labelNames: LabelName[];
    updateActiveLabelIdAction: (activeLabelId: string) => any;
}

const PointLabelsList: React.FC<IProps> = (
    {
        size,
        imageData,
        updateImageDataByIdAction,
        labelNames,
        updateActiveLabelNameIdAction,
        activeLabelId,
        highlightedLabelId,
        updateActiveLabelIdAction
    }
) => {
    const labelInputFieldHeight = 40;
    const listStyle: React.CSSProperties = {
        width: size.width,
        height: size.height
    };
    const listStyleContent: React.CSSProperties = {
        width: size.width,
        height: imageData.labelFeedbacks.length * labelInputFieldHeight
    };

    const deleteFeedbackLabelById = (labelFeedbackId: string) => {
        LabelActions.deleteFeedbackLabelById(imageData.id, labelFeedbackId);
    };

    const togglePointLabelVisibilityById = (labelFeedbackId: string) => {
        LabelActions.toggleLabelVisibilityById(imageData.id, labelFeedbackId);
    };

    const updatePointLabel = (labelFeedbackId: string, labelNameId: string) => {
        const newImageData = {
            ...imageData,
            labelFeedbacks: imageData.labelFeedbacks.map((labelFeedback: LabelFeedback) => {
                if (labelFeedback.id === labelFeedbackId) {
                    return {
                        ...labelFeedback,
                        labelId: labelNameId
                    }
                }
                return labelFeedback
            })
        };
        updateImageDataByIdAction(imageData.id, newImageData);
        updateActiveLabelNameIdAction(labelNameId);
    };

    const onClickHandler = () => {
        updateActiveLabelIdAction(null);
        // console.log(LabelFeedback.id)
    };

    const getChildren = () => {
        return imageData.labelFeedbacks
            .filter((labelFeedback: LabelFeedback) => labelFeedback.status === LabelStatus.ACCEPTED)
            .map((labelFeedback: LabelFeedback) => {
            return <LabelInputField
                size={{
                    width: size.width,
                    height: labelInputFieldHeight
                }}
                isActive={labelFeedback.id === activeLabelId}
                isHighlighted={labelFeedback.id === highlightedLabelId}
                isVisible={labelFeedback.isVisible}
                id={labelFeedback.id}
                key={labelFeedback.id}
                onDelete={deleteFeedbackLabelById}
                value={labelFeedback.labelId !== null ? findLast(labelNames, {id: labelFeedback.labelId}) : null}
                options={labelNames}
                onSelectLabel={updatePointLabel}
                toggleLabelVisibility={togglePointLabelVisibilityById}
            />
        });
    };

    return (
        <div
            className='FeedbackLabelsList'
            style={listStyle}
            onClickCapture={onClickHandler}
        >
            {imageData.labelFeedbacks.filter((labelFeedback: LabelFeedback) => labelFeedback.status === LabelStatus.ACCEPTED).length === 0 ?
                <EmptyLabelList
                    labelBefore={'Give your feedback on this image'}
                    labelAfter={'no labels created for this image yet'}
                /> :
                <Scrollbars>
                    <div
                        className='PointLabelsListContent'
                        style={listStyleContent}
                    >
                        {getChildren()}
                    </div>
                </Scrollbars>
            }
        </div>
    );
};

const mapDispatchToProps = {
    updateImageDataByIdAction: updateImageDataById,
    updateActiveLabelNameIdAction: updateActiveLabelNameId,
    updateActiveLabelIdAction: updateActiveLabelId
};

const mapStateToProps = (state: AppState) => ({
    activeLabelId: state.labels.activeLabelId,
    highlightedLabelId: state.labels.highlightedLabelId,
    labelNames : state.labels.labels
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PointLabelsList);

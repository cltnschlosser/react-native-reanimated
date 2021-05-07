import { requireNativeComponent, findNodeHandle, unstable_enableLogBox } from 'react-native';
import React from 'react';
import { runOnUI, makeMutable } from '../core';
import { withTiming, withStyleAnimation } from '../animations';
import { OpacityAnimation, ReverseAnimation } from './defaultAnimations';

const REALayoutView = requireNativeComponent('REALayoutView');
export class AnimatedLayout extends React.Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        return (
            <REALayoutView {...this.props} animated={true && !(this.props.animated === 'false')} />
        );
    }

}

// Register LayoutAnimationRepository

runOnUI(
    () => {
        'worklet';

        const configs = {};

        global.LayoutAnimationRepository = {
            configs,
            registerConfig(tag, config) {
                configs[tag] = config;
            },
            removeConfig(tag) {
                configs[tag].sv.value = {};
                delete configs[tag];
            },
            startAnimationForTag(tag, type, yogaValues) { 
                if (configs[tag] == null) {
                    return; // :(
                }

                console.log("animation will be started", tag, JSON.stringify(yogaValues));

                if (typeof configs[tag][type] != 'function') {
                    console.error(`${type} animation for a tag: ${tag} it not a function!`);
                }

                const styleFactory = configs[tag][type];
                console.log("animationObjectKeys", Object.keys(animation));
                const sv = configs[tag].sv;
                sv._value = styleFactory.initialValues;
                const animation = withStyleAnimation(styleFactory.animations);

                animation.callback = (finished) => {
                    if (finished) {
                        _stopObservingProgress(tag, finished);
                    }
                }
                console.log("animation has been started", tag, JSON.stringify(yogaValues));
                configs[tag].sv.value = animation;
                _startObservingProgress(tag, sv);
            },
        };  
    }
)();
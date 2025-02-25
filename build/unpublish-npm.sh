#!/bin/bash

REGISTRY="https://npmjs-registry.ivyteam.ch/"

npm unpublish "@axonivy/process-editor@${1}" --registry $REGISTRY
npm unpublish "@axonivy/process-editor-inscription@${1}" --registry $REGISTRY
npm unpublish "@axonivy/process-editor-inscription-core@${1}" --registry $REGISTRY
npm unpublish "@axonivy/process-editor-inscription-protocol@${1}" --registry $REGISTRY
npm unpublish "@axonivy/process-editor-inscription-view@${1}" --registry $REGISTRY
npm unpublish "@axonivy/process-editor-protocol@${1}" --registry $REGISTRY
npm unpublish "@axonivy/process-editor-view@${1}" --registry $REGISTRY

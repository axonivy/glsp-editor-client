import './diagram.css';

import {
  ConsoleLogger,
  CustomFeatures,
  DefaultTypes,
  DeleteElementContextMenuItemProvider,
  FeatureModule,
  GGraph,
  GModelElement,
  IView,
  LogLevel,
  TYPES,
  configureModelElement,
  moveFeature,
  selectFeature
} from '@eclipse-glsp/client';
import { interfaces } from 'inversify';

import { breakpointFeature } from '../breakpoint/model';
import { goToSourceFeature, jumpFeature } from '../jump/model';
import { IvyMovementRestrictor } from '../tools/movement-restrictor';
import { NegativeMarker } from '../tools/negative-area/model';
import { SNegativeMarkerView } from '../tools/negative-area/view';
import { multipleOutgoingEdgesFeature } from '../ui-tools/quick-action/edge/model';
import { singleWrapFeature, unwrapFeature } from '../wrap/model';
import { ActivityNodeView, SubActivityNodeView } from './activities/activity-views';
import { errorBoundaryFeature, signalBoundaryFeature } from './boundary/model';
import { EventNodeView, IntermediateEventNodeView } from './events/event-views';
import { GatewayNodeView } from './gateways/gateway-views';
import { IvyGraphView } from './grid/ivy-graph-view';
import { LaneNodeView, PoolNodeView, RotateLabelView } from './lanes/lane-views';
import {
  ActivityLabel,
  ActivityNode,
  CommentNode,
  Edge,
  EdgeLabel,
  EndEventNode,
  EventNode,
  GatewayNode,
  LaneNode,
  MulitlineEditLabel,
  RotateLabel,
  StartEventNode
} from './model';
import {
  ActivityTypes,
  EdgeTypes,
  EventBoundaryTypes,
  EventEndTypes,
  EventIntermediateTypes,
  EventStartTypes,
  GatewayTypes,
  LabelType,
  LaneTypes
} from './view-types';
import { AssociationEdgeView, ForeignLabelView, WorkflowEdgeView } from './views';

const ivyDiagramModule = new FeatureModule((bind, unbind, isBound, rebind) => {
  rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
  rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
  bind(TYPES.IContextMenuItemProvider).to(DeleteElementContextMenuItemProvider);
  bind(TYPES.IMovementRestrictor).to(IvyMovementRestrictor);

  const context = { bind, unbind, isBound, rebind };
  configureIvyModelElement(DefaultTypes.GRAPH, GGraph, IvyGraphView);
  configureStartEvent(EventStartTypes.START);
  configureStartEvent(EventStartTypes.START_ERROR);
  configureStartEvent(EventStartTypes.START_SIGNAL);
  configureStartEvent(EventStartTypes.START_PROGRAM, { enable: [goToSourceFeature] });
  configureStartEvent(EventStartTypes.START_SUB);
  configureStartEvent(EventStartTypes.START_WS);
  configureStartEvent(EventStartTypes.START_HD);
  configureStartEvent(EventStartTypes.START_HD_METHOD);
  configureStartEvent(EventStartTypes.START_HD_EVENT);
  configureStartEvent(EventStartTypes.START_EMBEDDED);
  configureStartEvent(EventStartTypes.START_THIRD_PARTY);

  configureEndEvent(EventEndTypes.END);
  configureEndEvent(EventEndTypes.END_ERROR);
  configureEndEvent(EventEndTypes.END_PAGE);
  configureEndEvent(EventEndTypes.END_SUB);
  configureEndEvent(EventEndTypes.END_WS);
  configureEndEvent(EventEndTypes.END_HD);
  configureEndEvent(EventEndTypes.END_HD_EXIT);
  configureEndEvent(EventEndTypes.END_EMBEDDED);

  configureIvyModelElement(EventIntermediateTypes.INTERMEDIATE_TASK, EventNode, IntermediateEventNodeView);
  configureIvyModelElement(EventIntermediateTypes.INTERMEDIATE_WAIT, EventNode, IntermediateEventNodeView, { enable: [goToSourceFeature] });
  configureIvyModelElement(EventIntermediateTypes.INTERMEDIATE_THIRD_PARTY, EventNode, IntermediateEventNodeView);

  configureIvyModelElement(EventBoundaryTypes.BOUNDARY_ERROR, StartEventNode, IntermediateEventNodeView);
  configureIvyModelElement(EventBoundaryTypes.BOUNDARY_SIGNAL, StartEventNode, IntermediateEventNodeView);

  configureGateway(GatewayTypes.TASK);
  configureGateway(GatewayTypes.JOIN, { disable: [multipleOutgoingEdgesFeature] });
  configureGateway(GatewayTypes.SPLIT);
  configureGateway(GatewayTypes.ALTERNATIVE);

  configureIvyModelElement(ActivityTypes.LABEL, ActivityLabel, ForeignLabelView);
  configureIvyModelElement(ActivityTypes.COMMENT, CommentNode, ActivityNodeView, {
    disable: [breakpointFeature, errorBoundaryFeature, singleWrapFeature]
  });
  configureActivity(ActivityTypes.GENERIC);
  configureActivity(ActivityTypes.SCRIPT);
  configureActivity(ActivityTypes.SOAP);
  configureActivity(ActivityTypes.REST);
  configureActivity(ActivityTypes.DB);
  configureActivity(ActivityTypes.EMAIL);
  configureActivity(ActivityTypes.THIRD_PARTY);
  configureActivity(ActivityTypes.THIRD_PARTY_RULE);
  configureActivity(ActivityTypes.PROGRAM, { enable: [goToSourceFeature] });
  configureActivity(ActivityTypes.TRIGGER, { enable: [jumpFeature] });
  configureActivity(ActivityTypes.HD, { enable: [jumpFeature, goToSourceFeature] });
  configureActivity(ActivityTypes.USER, {
    enable: [signalBoundaryFeature, jumpFeature, goToSourceFeature]
  });
  configureEmbedded(ActivityTypes.SUB_PROCESS, { enable: [jumpFeature], disable: [singleWrapFeature] });
  configureEmbedded(ActivityTypes.EMBEDDED_PROCESS);
  configureEmbedded(ActivityTypes.BPMN_GENERIC);
  configureEmbedded(ActivityTypes.BPMN_MANUAL);
  configureEmbedded(ActivityTypes.BPMN_RECEIVE);
  configureEmbedded(ActivityTypes.BPMN_RULE);
  configureEmbedded(ActivityTypes.BPMN_SCRIPT);
  configureEmbedded(ActivityTypes.BPMN_SEND);
  configureEmbedded(ActivityTypes.BPMN_SERVICE);
  configureEmbedded(ActivityTypes.BPMN_USER);

  configureIvyModelElement(LaneTypes.LANE, LaneNode, LaneNodeView);
  configureIvyModelElement(LaneTypes.POOL, LaneNode, PoolNodeView);
  configureIvyModelElement(LaneTypes.LABEL, RotateLabel, RotateLabelView);

  configureIvyModelElement(EdgeTypes.DEFAULT, Edge, WorkflowEdgeView);
  configureIvyModelElement(EdgeTypes.ASSOCIATION, Edge, AssociationEdgeView);
  configureIvyModelElement(EdgeTypes.LABEL, EdgeLabel, ForeignLabelView, { enable: [selectFeature, moveFeature] });

  configureIvyModelElement(LabelType.DEFAULT, MulitlineEditLabel, ForeignLabelView, { enable: [selectFeature, moveFeature] });
  configureIvyModelElement(NegativeMarker.TYPE, NegativeMarker, SNegativeMarkerView);

  function configureIvyModelElement(
    type: string,
    modelConstr: new () => GModelElement,
    viewConstr: interfaces.ServiceIdentifier<IView>,
    features?: CustomFeatures
  ): void {
    configureModelElement(context, type, modelConstr, viewConstr, features);
  }

  function configureStartEvent(type: string, features?: CustomFeatures): void {
    configureIvyModelElement(type, StartEventNode, EventNodeView, features);
  }

  function configureEndEvent(type: string, features?: CustomFeatures): void {
    configureIvyModelElement(type, EndEventNode, EventNodeView, features);
  }

  function configureGateway(type: string, features?: CustomFeatures): void {
    configureIvyModelElement(type, GatewayNode, GatewayNodeView, features);
  }

  function configureActivity(type: string, features?: CustomFeatures): void {
    configureIvyModelElement(type, ActivityNode, ActivityNodeView, features);
  }

  function configureEmbedded(type: string, features?: CustomFeatures): void {
    configureIvyModelElement(
      type,
      ActivityNode,
      SubActivityNodeView,
      features ? features : { enable: [jumpFeature, unwrapFeature, multipleOutgoingEdgesFeature], disable: [singleWrapFeature] }
    );
  }
});

export default ivyDiagramModule;

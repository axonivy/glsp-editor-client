/* eslint-disable no-unused-expressions */
import { SNode } from '@eclipse-glsp/client';
import { describe, test, expect, afterEach } from 'vitest';
import { addCssClass, addCssClassToElements, removeCssClass, removeCssClassOfElements } from './element-css-classes';

describe('ElementCssClassesUtil', () => {
  const node = new SNode();
  const node2 = new SNode();

  afterEach(() => {
    node.cssClasses = undefined;
    node2.cssClasses = undefined;
  });

  test('addCssClass', () => {
    addCssClass(node, 'test');
    expect(node.cssClasses).to.include('test');
  });

  test('addCssClass only once', () => {
    addCssClass(node, 'test');
    addCssClass(node, 'test');
    addCssClass(node, 'test2');
    expect(node.cssClasses).to.have.length(2).and.to.include('test').and.include('test2');
  });

  test('removeCssClass', () => {
    node.cssClasses = ['bla', 'test'];
    removeCssClass(node, 'test');
    expect(node.cssClasses).to.include('bla').but.not.to.include('test');
  });

  test('removeCssClass of empty array', () => {
    removeCssClass(node, 'nothingToRemove');
    expect(node.cssClasses).to.be.undefined;
  });

  test('addCssClassToElements', () => {
    addCssClassToElements([node, node2], 'test');
    expect(node.cssClasses).to.include('test');
    expect(node2.cssClasses).to.include('test');
  });

  test('addCssClassToElements only once', () => {
    addCssClassToElements([node, node2], 'test');
    addCssClassToElements([node, node2], 'test');
    addCssClassToElements([node, node2], 'test2');
    expect(node.cssClasses).to.have.length(2).and.to.include('test').and.include('test2');
    expect(node2.cssClasses).to.have.length(2).and.to.include('test').and.include('test2');
  });

  test('removeCssClassOfElements', () => {
    node.cssClasses = ['bla', 'test'];
    node2.cssClasses = ['bla', 'test'];
    removeCssClassOfElements([node, node2], 'test');
    expect(node.cssClasses).to.include('bla').but.not.to.include('test');
    expect(node2.cssClasses).to.include('bla').but.not.to.include('test');
  });

  test('removeCssClassOfElements of empty array', () => {
    removeCssClassOfElements([node, node2], 'nothingToRemove');
    expect(node.cssClasses).to.be.undefined;
    expect(node2.cssClasses).to.be.undefined;
  });
});

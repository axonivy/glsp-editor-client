import type { Part } from '../../page-objects/inscription/Part';
import type { Select } from '../../page-objects/inscription/Select';
import { NewPartTest, PartObject } from './part-tester';
import type { Section } from '../../page-objects/inscription/Section';

class DbErrorPart extends PartObject {
  section: Section;
  error: Select;

  constructor(part: Part) {
    super(part);
    this.section = part.section('Error');
    this.error = this.section.select({});
  }

  async fill(): Promise<void> {
    await this.section.expectIsClosed();
    await this.section.toggle();
    await this.error.choose('>> Ignore Exception');
  }
  async assertFill(): Promise<void> {
    await this.section.expectIsOpen();
    await this.error.expectValue('>> Ignore Exception');
  }
  async clear(): Promise<void> {
    await this.error.choose('ivy:error:database');
  }
  async assertClear(): Promise<void> {
    await this.section.expectIsClosed();
  }
}

export const DbErrorTest = new NewPartTest('Error', (part: Part) => new DbErrorPart(part));

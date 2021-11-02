import React, { useMemo } from 'react';
import SimpleMDE from 'react-simplemde-editor';
import type EasyMDE from "easymde";
import { FunctionComponent } from 'react';
import Markdown from './Markdown';
import type { Editor as SimpleMDEEditor } from 'codemirror';
import type { KeyboardEvent } from 'react';
import { TabPanel, Tab, TabList, Tabs, TabPanels } from '@chakra-ui/react';

interface EditorArgs {
  onChange: (newVal: string) => void;
  value: string;
  onSubmit?: () => void;
}

const Editor: FunctionComponent<EditorArgs> = (args) => {

  const options = useMemo(() => {
    return {
      toolbar: [
        'bold',
        'italic',
        'strikethrough',
        '|',
        'heading-3',
        'quote',
        '|',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'guide',
      ],
      spellChecker: true,
    } as EasyMDE.Options;
  }, []);

  return (
    <Tabs>
      <TabList>
        <Tab>
          Edit
        </Tab>
        <Tab>
          Preview
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <SimpleMDE
            tabIndex={2}
            onChange={args.onChange}
            value={args.value}
            events={{
              // @ts-ignore
              keydown: (
                _instance: SimpleMDEEditor,
                evt: KeyboardEvent<HTMLDivElement>
              ) => {
                if (evt.key === 'Enter' && evt.ctrlKey && args.onSubmit) {
                  setTimeout(() => {
                    args.onSubmit!();
                  }, 0);
                }
              },
            }}
            options={options}
          />
        </TabPanel>
        <TabPanel>
          <Markdown content={args.value} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Editor;

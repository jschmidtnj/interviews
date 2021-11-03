#!/usr/bin/env python3

# instantiate a file system object
# call mkdir and touch

# make a graph / -> /a1 -> /a1, /a2, etc.

from typing import List, Dict, Set

class Folder:
    def __init__(self, name: str) -> None:
        self.name = name
        self.child_folders: Dict[str, Folder] = {}
        self.files: Set[str] = set()

    def __str__(self) -> str:
        return f'name: "{self.name}"'

class FileSystem:
    def __init__(self) -> None:
        self.root: Folder = Folder('')
        self.path_seperator = '/'

    def get_parent_folder(self, path_elements: List[str]) -> Folder:
        curr_folder = self.root
        for name in path_elements[:-1]:
            if name in curr_folder.child_folders:
                curr_folder = curr_folder.child_folders[name]
            else:
                raise ValueError(f'folder "{name}" does not exist')
        return curr_folder

    def touch(self, file_path: str) -> None:
        path_elements = file_path.split(self.path_seperator)
        parent_folder = self.get_parent_folder(path_elements)
        file_name = path_elements[-1]
        parent_folder.files.add(file_name)

    def mkdir(self, folder_path: str) -> None:
        path_elements = folder_path.split(self.path_seperator)
        parent_folder = self.get_parent_folder(path_elements)

        folder_name = path_elements[-1]
        if folder_name in parent_folder.child_folders:
            raise ValueError(f'folder already exists at location "{folder_path}"')

        parent_folder.child_folders[folder_name] = Folder(folder_name)

if __name__ == '__main__':
    fs = FileSystem()
    fs.mkdir('')
    fs.mkdir('/test')
    print(fs.root.child_folders)
    fs.touch('/test/asdf')
    try:
        fs.mkdir('')
    except ValueError as err:
        print(f'got err: {err} :)')
    fs.touch('/test/asdf')
    print(fs.root.child_folders)
    print(fs.root.child_folders[''].files)
    print(fs.root.child_folders[''].child_folders['test'].files)
    try:
        fs.mkdir('/not_exist/name')
    except ValueError as err:
        print(f'got err: {err} :)')

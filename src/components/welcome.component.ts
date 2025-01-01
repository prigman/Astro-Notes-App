import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-notes',
	standalone: true,
	styleUrls: ['./welcome.component.scss'],
	imports: [CommonModule, FormsModule],
	template: `
	<div id="container">
		<main>
			<div class="app" id="app">
				<div class="bg"></div>
				<section class="preview">
					<input [(ngModel)]="noteTitle" type="text" class="title" placeholder="Enter a title" />
					<textarea [(ngModel)]="noteText" class="text" name="" id="" placeholder="Enter a text"
					></textarea>
					<div class="choose">
						<button (click)="addNewNote('first-color')" class="choose-btn first-color" type="button">Add</button>
						<button (click)="addNewNote('second-color')" class="choose-btn second-color" type="button">Add</button>
						<button (click)="addNewNote('third-color')" class="choose-btn third-color" type="button">Add</button>
					</div>
				</section>
				<section class="category-list">
					<div class="title">Sort by</div>
					<div class="select">
						<button (click)="setNotesColor('first-color')" class="category-btn first-color" type="button"></button>
						<button (click)="setNotesColor('second-color')" class="category-btn second-color" type="button"></button>
						<button (click)="setNotesColor('third-color')" class="category-btn third-color" type="button"></button>
						<img (click)="setNotesColor('')" class="category-btn-all" src="/Group 1.svg" alt="" />
					</div>
				</section>
				<section class="notes">
					<div class="list">
						<div class="item" *ngFor="let note of getNotes(notesSortByColor)">
							<div class="item-back" [ngClass]="note.color"></div>
							<div class="item-bg">
								<div class="body">
									<div class="title">{{ note.title }}</div>
									<div class="text">{{ note.text }}</div>
								</div>
								<div class="footer">
									<div (click)="removeNote(note)" class="remove">Remove</div>
									<div class="date">{{ note.updatedLocal }}</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>
		</main>
	</div>
	`
})

export class NotesAppComponent {

	noteTitle: string = "";
	noteText: string = "";

	localStorageKey: string = 'astronotesapp-notes';

	notesSortByColor : string = "";

	notesList: Note[] = [];

	ngOnInit(): void {
		this.notesList = this.getNotes(this.notesSortByColor)
	}

	getNotes(sortColor: string): Note[] {
		if (typeof localStorage === 'undefined') {
			return [];
		}
		const notesList: Note[] = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
		switch(sortColor)
		{
			case "":
				return this.sortNotesByDate(notesList);
			default:
				return this.sortNotesByDate(notesList).filter((value: Note) => value.color === sortColor);
		}
	}

	saveNote(noteToSave: Note): void {
		if (typeof localStorage === 'undefined' || noteToSave.title === '' || noteToSave.text === '') {
			return;
		}
		noteToSave.id = Math.floor(Math.random() * 1000000);
		noteToSave.updatedISO = new Date().toISOString();
		noteToSave.updatedLocal = new Date(noteToSave.updatedISO).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short"});
		this.notesList.push(noteToSave);
		this.updateLocalStorage();
	}

	addNewNote(noteColor: string): void {
		this.saveNote({
			title: this.noteTitle,
			text: this.noteText,
			color: noteColor
		});
		this.noteTitle = '';
		this.noteText = '';
	}

	removeNote(note : Note): void {
		const index: number = this.notesList.findIndex(value => value.id === note.id);
		if (index > -1) {
			this.notesList.splice(index, 1);
		}
		this.updateLocalStorage();
	}

	sortNotesByDate(notesList: Note[]): Note[] {
		return notesList.sort((a, b) => {
			return new Date(a.updatedISO || 0) > new Date(b.updatedISO || 0) ? -1 : 1;
		})
	}

	setNotesColor(sortColor: string): void {
		this.notesSortByColor = sortColor;
	}

	updateLocalStorage(): void {
		localStorage.setItem(this.localStorageKey, JSON.stringify(this.notesList));
	}
}

export interface Note {
	id?: number;
	title: string;
	text: string;
	updatedISO?: string;
	updatedLocal?: string;
	color: string;
}
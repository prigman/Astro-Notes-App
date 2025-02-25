import { Component, ChangeDetectorRef } from '@angular/core';
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

						<div *ngIf="isLoading" class="loading">Loading...</div>

						<button (click)="fetchNotes()" *ngIf=" !isLoading && !notesLocalList.length && !fetchedNotesList.length" type="button">Fetch fake notes</button>

						<div class="item" *ngFor="let note of (notesLocalList.length ? getNotes(notesSortColor) : [])">
							<div class="item-back" [ngClass]="note.color"></div>
							<div class="item-bg">
								<div class="body">
									<div class="title">{{ note.title }}</div>
									<div class="text">{{ note.text }}</div>
								</div>
								<div class="footer">
									<div (click)="removeNote(note, notesLocalList)" class="remove">Remove</div>
									<div class="date">{{ note.updatedLocal }}</div>
								</div>
							</div>
						</div>
						
						<div class="item" *ngFor="let noteFetched of (fetchedNotesList.length ? getFetchedNotes(notesSortColor) : [])">
							<div class="item-back" [ngClass]="noteFetched.color"></div>
							<div class="item-bg">
								<div class="body">
									<div class="title">{{ noteFetched.title }}</div>
									<div class="text">{{ noteFetched.text }}</div>
								</div>
								<div class="footer">
									<div (click)="removeNote(noteFetched, fetchedNotesList)" class="remove">Remove</div>
									<div class="date">{{ noteFetched.updatedLocal }}</div>
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

	noteTitle: string;
	
	noteText: string;

	localStorageKey: string;

	notesSortColor : string;

	isLoading: boolean;

	notesLocalList: Note[];

	fetchedNotesList: Note[];

	allColors: string[];

	constructor(private cdr : ChangeDetectorRef) {
		this.allColors = ['first-color', 'second-color', 'third-color'];
		this.isLoading = false;
		this.noteTitle = "";
		this.noteText = "";
		this.notesSortColor = "";
		this.notesLocalList = [];
		this.fetchedNotesList = [];
		this.localStorageKey = "astronotesapp-notes";
	}

	ngOnInit(): void {
		this.notesLocalList = this.getNotes(this.notesSortColor);
		if (typeof document !== "undefined") {
			document.querySelectorAll("link[rel='stylesheet']").forEach((el) => el.remove());
		}
	}

	getFetchedNotes(sortColor: string): Note[] {
		return this.getNotesByColor(sortColor, this.fetchedNotesList);
	}

	getNotes(sortColor: string): Note[] {
		if (typeof localStorage === 'undefined') {
			return [];
		}
		const listOfNotes = JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
		return this.getNotesByColor(sortColor, listOfNotes);
	}

	saveNote(noteToSave: Note, listOfNotes : Note[]): void {
		if (noteToSave.title === '' || noteToSave.text === '') {
			return;
		}
		noteToSave.id = Math.floor(Math.random() * 1000000);
		noteToSave.updatedISO = new Date().toISOString();
		noteToSave.updatedLocal = this.convertToLocalDate(noteToSave.updatedISO);
		listOfNotes.push(noteToSave);
		if(listOfNotes === this.notesLocalList && typeof localStorage !== 'undefined') 
			this.updateLocalStorage();
	}

	addNewNote(noteColor: string): void {
		this.saveNote({
			title: this.noteTitle,
			text: this.noteText,
			color: noteColor
		}, this.notesLocalList);
		this.noteTitle = '';
		this.noteText = '';
	}

	removeNote(note : Note, listOfNotes: Note[]): void {
		const index: number = listOfNotes.findIndex(value => value.id === note.id);
		if (index > -1) {
			listOfNotes.splice(index, 1);
		}
		if(listOfNotes === this.notesLocalList)
			this.updateLocalStorage();
		else
			this.cdr.detectChanges();
	}

	sortNotesByDate(note: Note[]): Note[] {
		return note.sort((a, b) => {
			return new Date(a.updatedISO || 0) > new Date(b.updatedISO || 0) ? -1 : 1;
		})
	}

	setNotesColor(sortColor: string): void {
		this.notesSortColor = sortColor;
	}

	getNotesByColor(sortColor: string, listOfNotes: Note[]): Note[] {
		switch(sortColor)
		{
			case "":
				return this.sortNotesByDate(listOfNotes);
			default:
				return this.sortNotesByDate(listOfNotes).filter((value: Note) => value.color === sortColor);
		}
	}

	updateLocalStorage(): void {
		localStorage.setItem(this.localStorageKey, JSON.stringify(this.notesLocalList));
	}

	convertToLocalDate(ISOdate: string): string {
		return new Date(ISOdate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short"})
	}

	getRandomColor(): string {
		const index = Math.floor(Math.random() * this.allColors.length);
		return this.allColors[index];
	}

	async fetchNotes(): Promise<void> {
		this.isLoading = true;
		try {
			const response: Response = await fetch('https://jsonplaceholder.typicode.com/posts');
			const data: any = await response.json();
			data.splice(data.length / 2, data.length);
			data.forEach((item: any) => {
				this.saveNote({
					title: item.title,
					text: item.body,
					color: this.getRandomColor()
				}, this.fetchedNotesList);
			});
		}
		catch(error) {
			console.log(error);
		}
		finally {
			this.isLoading = false;
			this.cdr.detectChanges();
		}
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
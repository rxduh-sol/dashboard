import customtkinter as ctk
import json
import os
import re
from datetime import datetime, timedelta

# Base path to your public folder
BASE_PATH = "/home/manhi/Desktop/Novark/my-preppy-dashboard/public"

class App(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("Novark Dashboard Sync")
        self.geometry("450x780")
        ctk.set_appearance_mode("light")
        
        self.grid_columnconfigure(0, weight=1)
        
        # --- MODE SWITCH (School vs General) ---
        self.mode_var = ctk.StringVar(value="General")
        self.mode_switch = ctk.CTkSegmentedButton(
            self, values=["General", "School"],
            command=self.update_header,
            selected_color="#18181b",
            unselected_color="#f4f4f5",
            unselected_hover_color="#e4e4e7"
        )
        self.mode_switch.set("General")
        self.mode_switch.grid(row=0, column=0, padx=20, pady=(30, 10))

        self.header = ctk.CTkLabel(self, text="NEW GENERAL TASK", font=ctk.CTkFont(size=22, weight="bold"))
        self.header.grid(row=1, column=0, padx=20, pady=10)

        # Input Fields
        self.title_entry = self.make_entry("Task Title (e.g. Translation Bee)")
        self.subject_entry = self.make_entry("Subject (e.g. German)")
        self.time_entry = self.make_entry("Time (e.g. 12:30)")

        # --- QUICK DATE SELECTOR ---
        self.date_label = ctk.CTkLabel(self, text="Due Date:", font=ctk.CTkFont(size=12, weight="bold"))
        self.date_label.grid(row=5, column=0, sticky="w", padx=75, pady=(10, 0))
        
        self.date_options = self.generate_date_options()
        self.date_var = ctk.StringVar(value=list(self.date_options.keys())[0])
        
        # FIXED: Removed 'hover_color' which was causing the crash
        self.date_menu = ctk.CTkOptionMenu(
            self, values=list(self.date_options.keys()), 
            variable=self.date_var, corner_radius=15,
            fg_color="#f4f4f5", text_color="#18181b", button_color="#e4e4e7",
            width=300, height=40
        )
        self.date_menu.grid(row=6, column=0, padx=20, pady=10)

        # Priority Dropdown
        self.priority_label = ctk.CTkLabel(self, text="Priority:", font=ctk.CTkFont(size=12, weight="bold"))
        self.priority_label.grid(row=7, column=0, sticky="w", padx=75)
        self.priority_var = ctk.StringVar(value="medium")
        self.priority_menu = ctk.CTkOptionMenu(self, values=["low", "medium", "high"], 
                                               variable=self.priority_var, corner_radius=15,
                                               fg_color="#18181b", button_color="#18181b", width=300)
        self.priority_menu.grid(row=8, column=0, padx=20, pady=10)

        # Details Box
        self.details_label = ctk.CTkLabel(self, text="Details:", font=ctk.CTkFont(size=12, weight="bold"))
        self.details_label.grid(row=9, column=0, sticky="w", padx=75)
        self.details_text = ctk.CTkTextbox(self, width=300, height=100, corner_radius=15, border_width=2)
        self.details_text.grid(row=10, column=0, padx=20, pady=10)

        # Submit
        self.add_button = ctk.CTkButton(self, text="PUSH TO DASHBOARD", command=self.add_task, 
                                        fg_color="#18181b", hover_color="#3f3f46", 
                                        height=50, width=300, corner_radius=15, font=ctk.CTkFont(weight="bold"))
        self.add_button.grid(row=11, column=0, padx=20, pady=20)

        self.status_label = ctk.CTkLabel(self, text="", font=ctk.CTkFont(size=10))
        self.status_label.grid(row=12, column=0, pady=5)

    def update_header(self, mode):
        self.header.configure(text=f"NEW {mode.upper()} TASK")

    def generate_date_options(self):
        options = {}
        for i in range(14):
            date_obj = datetime.now() + timedelta(days=i)
            if i == 0: label = f"Today ({date_obj.strftime('%a, %b %d')})"
            elif i == 1: label = f"Tomorrow ({date_obj.strftime('%a, %b %d')})"
            else: label = date_obj.strftime("%A, %b %d")
            options[label] = date_obj.strftime("%Y-%m-%d")
        return options

    def make_entry(self, placeholder):
        entry = ctk.CTkEntry(self, placeholder_text=placeholder, width=300, height=40, corner_radius=15)
        entry.grid(padx=20, pady=8)
        return entry

    def generate_next_id(self, tasks, prefix):
        if not tasks: return f"{prefix}-01"
        regex = rf'{prefix}-(\d+)'
        ids = [int(m.group(1)) for t in tasks if (m := re.search(regex, t.get('id', '')))]
        return f"{prefix}-{max(ids) + 1:02d}" if ids else f"{prefix}-01"

    def add_task(self):
        try:
            mode = self.mode_switch.get() # "General" or "School"
            target_file = "general.json" if mode == "General" else "School.json"
            prefix = "general" if mode == "General" else "school"
            full_path = os.path.join(BASE_PATH, target_file)

            if os.path.exists(full_path):
                with open(full_path, 'r') as f: tasks = json.load(f)
            else: tasks = []

            selected_label = self.date_var.get()
            formatted_date = self.date_options[selected_label]

            new_task = {
                "id": self.generate_next_id(tasks, prefix),
                "title": self.title_entry.get(),
                "isPinned": False,
                "dueDate": formatted_date,
                "dueTime": self.time_entry.get(),
                "details": self.details_text.get("1.0", "end-1c"),
                "references": [],
                "subject": self.subject_entry.get(),
                "priority": self.priority_var.get(),
                "status": "todo"
            }

            if not new_task["title"]:
                self.status_label.configure(text="TITLE REQUIRED", text_color="red")
                return

            tasks.append(new_task)
            with open(full_path, 'w') as f: json.dump(tasks, f, indent=4)

            self.status_label.configure(text=f"SYNCED TO {target_file}", text_color="green")
            self.title_entry.delete(0, 'end')
            self.details_text.delete("1.0", "end")

        except Exception as e:
            self.status_label.configure(text=f"ERROR: {str(e)}", text_color="red")

if __name__ == "__main__":
    app = App()
    app.mainloop()
import { Component, NodeRefTypes, calc } from "j-templates";
import { a, button, div, h1, input, span, table, tbody, td, tr } from "j-templates/DOM";
import { Scope, State, Value } from "j-templates/Utils";
import { buildData } from "./buildData";

interface ButtonEvents {
  Create1000: void;
  Create10000: void;
  Append1000: void;
  UpdateEvery10: void;
  Swap: void;
  Clear: void;
  Sort: void;
}

class Buttons extends Component<void, void, ButtonEvents> {
  Template(): NodeRefTypes | NodeRefTypes[] {
    return [
      div({ props: { className: "col-sm-6 smallpad" } }, () => [
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "run" },
            on: { click: () => this.Fire("Create1000") }
          },
          () => "Create 1,000 rows"
        ),
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "runlots" },
            on: { click: () => this.Fire("Create10000") }
          },
          () => "Create 10,000 rows"
        ),
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "add" },
            on: { click: () => this.Fire("Append1000") }
          },
          () => "Append 1,000 rows"
        ),
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "update" },
            on: { click: () => this.Fire("UpdateEvery10") }
          },
          () => "Update every 10th row"
        ),
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "clear" },
            on: { click: () => this.Fire("Clear") }
          },
          () => "Clear"
        ),
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "swaprows" },
            on: { click: () => this.Fire("Swap") }
          },
          () => "Swap rows"
        ),
        button(
          {
            props: { className: "btn btn-primary btn-block", type: "button", id: "swaprows" },
            on: { click: () => this.Fire("Sort") }
          },
          () => "Sort"
        ),
      ]),
    ];
  }
}

const buttonsComponent = Component.ToFunction("div", undefined, Buttons);

type TableData = { id: number; label: string }[];

class App extends Component {
  @State()
  rows: TableData = [];

  @Value()
  selectedId?: number;

  @Value()
  sort = false;

  @Value()
  filter = "";

  @Scope()
  get sortedRows() {
    let rows = this.rows;
    const sort = this.sort;
    if (sort) {
      rows = rows.slice().sort((a, b) => a.label < b.label ? -1 : (a.label === b.label ? 0 : 1));
    }

    return rows;
  }

  @Scope()
  get visibleRows() {
    let rows = this.sortedRows;

    const filter = this.filter;
    if (filter)
      rows = rows.filter(row => row.label.includes(filter));

    return rows;
  }

  Template(): NodeRefTypes | NodeRefTypes[] {
    return [
      div({ props: { className: "jumbotron" } }, () =>
        div({ props: { className: "row" } }, () => [
          div({ props: { className: "col-md-6 " } }, () => h1({}, () => "J-Templates non-keyed")),
          div({ props: { className: "col-md-6 " } }, () =>
            buttonsComponent({
              props: { className: "row" },
              on: {
                Create1000: () => this.Create(1000),
                Create10000: () => this.Create(10000),
                Append1000: () => this.Append(1000),
                UpdateEvery10: () => this.UpdateEvery(10),
                Clear: () => this.Create(0),
                Swap: () => this.Swap(),
                Sort: () => this.ToggleSort()
              },
            })
          ),
          div({ props: { className: "col-md-6" } }, () =>
            input({ props: () => ({ value: this.filter }), on: { keyup: (event: any) => this.filter = event.target.value } })
          )
        ])
      ),
      table(
        {
          props: { className: "table table-hover table-striped test-data" },
        },
        () =>
          tbody({ data: () => this.visibleRows }, (row) =>
            tr({ props: () => this.selectedId === row.id && { className: "danger" } }, () => [
              td({ props: { className: "col-md-1" } }, () => `${row.id}`),
              td({ props: { className: "col-md-4" } }, () =>
                a({ on: { click: () => this.Select(row.id) } }, () => row.label)
              ),
              td({ props: { className: "col-md-1" } }, () =>
                a({ on: { click: () => this.Delete(row.id) } }, () =>
                  span({ props: { className: "glyphicon glyphicon-remove" }, attrs: { "aria-hidden": "true" } })
                )
              ),
              td({ props: { className: "col-md-6" } })
            ])
          )
      )
    ];
  }

  private UpdateEvery(count: number) {
    for (let x = 0; x < this.rows.length; x++)
      if (x % count === 0)
        this.rows[x].label += " !!!";
  }

  private Select(rowId: number) {
    this.selectedId = this.selectedId === rowId ? undefined : rowId;
  }

  private Delete(rowId: number) {
    const index = this.rows.findIndex((row) => row.id === rowId);
    if (index >= 0) this.rows.splice(index, 1);
  }

  private Create(count: number) {
    this.rows = buildData(count);
  }

  private Append(count: number) {
    this.rows.push(...buildData(count));
  }

  private Swap() {
    const data = this.rows;
    if (data.length > 998) {
      const temp1 = { ...data[1] };
      const temp2 = { ...data[998] };
      Object.assign(data[1], temp2);
      Object.assign(data[998], temp1);
    }
  }

  private ToggleSort() {
    this.sort = !this.sort;
  }
}

const appComponent = Component.ToFunction("div", undefined, App);

const root = window.document.getElementById("main");
root && Component.Attach(root, appComponent({ props: { className: "container" } }));

migration.up = function(migrator) {
  var db = migrator.db;
  var table = migrator.table;

  migrator.createTable({
    columns: {
      'id': 'integer primary key autoincrement',
      'contents': 'text'
    }
  });

  db.execute('ALTER TABLE ' + table + ' ADD COLUMN priority STRING DEFAULT ""');

  var rows = db.execute('SELECT * FROM ' + table + ';');
  while (rows.isValidRow()) {
    var contents = rows.fieldByName('contents');

    var priorityPos = contents.lastIndexOf('*');
    if (0 > priorityPos) {
      rows.next();
      continue;
    }

    var priorityString = contents.substring(0, priorityPos + 1);
    var contentsBody = contents.substring(priorityPos + 1);

    var updateQuery = 'UPDATE ' + table +
          ' SET priority = "' + priorityString + '", contents = "' + contentsBody +
          '" WHERE id  = ' + rows.fieldByName('id') + ';';

    db.execute(updateQuery);

    rows.next();
  }
};

migration.down = function(migrator) {
  var db = migrator.db;
  var table = migrator.table;
  var backup_table = table + '_backup';

  db.execute('CREATE TEMPORARY TABLE ' + backup_table + '(id,contents,priority);');
  db.execute('INSERT INTO ' + backup_table + ' SELECT id,contents,priority FROM ' + table + ';');

  migrator.dropTable();
  migrator.createTable({
    columns: {
      'id': 'integer primary key autoincrement',
      'contents': 'text'
    }
  });

  var rows = db.execute('SELECT * FROM ' + backup_table + ';');
  while (rows.isValidRow()) {
    var id = rows.fieldByName('id');
    var contents = rows.fieldByName('contents');
    var priority = rows.fieldByName('priority');

    var updateQuery = 'INSERT INTO ' + table + ' (id,contents) VALUES (' + id + ',"' + priority + contents + '");';
    db.execute(updateQuery);

    rows.next();
  }

  db.execute('DROP TABLE ' + backup_table + ';');
};

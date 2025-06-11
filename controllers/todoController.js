const Todo = require('../models/Todo');

class TodoController {
  static async index(req, res) {
    try {
      const todos = await Todo.getAllByUser(req.session.userId);
      res.render('todos/index', {
        todos,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      req.flash('error', 'Gagal mengambil daftar todo');
      res.redirect('/dashboard');
    }
  }

  static async create(req, res) {
    try {
      const { title } = req.body;
      
      // Validasi input
      if (!title || title.trim() === '') {
        req.flash('error', 'Judul todo tidak boleh kosong');
        return res.redirect('/todos');
      }

      await Todo.create(title, req.session.userId);
      req.flash('success', 'Todo berhasil dibuat');
      res.redirect('/todos');
    } catch (error) {
      console.error('Error creating todo:', error);
      req.flash('error', 'Gagal membuat todo');
      res.redirect('/todos');
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      // Validasi input
      if (!title || title.trim() === '') {
        req.flash('error', 'Judul todo tidak boleh kosong');
        return res.redirect('/todos');
      }

      const todo = await Todo.findById(id);
      if (!todo || todo.user_id !== req.session.userId) {
        req.flash('error', 'Todo tidak ditemukan');
        return res.redirect('/todos');
      }

      await Todo.update(id, title, req.session.userId);
      req.flash('success', 'Todo berhasil diupdate');
      res.redirect('/todos');
    } catch (error) {
      console.error('Error updating todo:', error);
      req.flash('error', 'Gagal mengupdate todo');
      res.redirect('/todos');
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      const todo = await Todo.findById(id);
      if (!todo || todo.user_id !== req.session.userId) {
        req.flash('error', 'Todo tidak ditemukan');
        return res.redirect('/todos');
      }

      await Todo.delete(id, req.session.userId);
      req.flash('success', 'Todo berhasil dihapus');
      res.redirect('/todos');
    } catch (error) {
      console.error('Error deleting todo:', error);
      req.flash('error', 'Gagal menghapus todo');
      res.redirect('/todos');
    }
  }
}

module.exports = TodoController;